import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DocumentItem } from '@/types/document'

export function useDocumentsData() {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)

  const hasMore = useMemo(() => documents.length < total, [documents.length, total])

  const fetchDocuments = useCallback(async ({ reset = false, pageParam }: { reset?: boolean; pageParam?: number } = {}) => {
    try {
      if (reset) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      const currentPage = pageParam ?? page
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('limit', String(limit))
      const q = searchQuery.trim()
      if (q) params.set('search', q)

      const response = await fetch(`/api/documents?${params.toString()}`, { cache: 'no-store', credentials: 'include' })
      if (!response.ok) {
        let message = 'Erreur lors du chargement des fichiers'
        try {
          const err = await response.json().catch(() => null)
          if (err?.error && typeof err.error === 'string') message = err.error
        } catch (_) {
          // ignore
        }

        if (response.status === 401) {
          setError('Session expirée. Redirection vers la connexion...')
          try { router.push('/login') } catch { window.location.href = '/login' }
          return
        }
        if (response.status === 403) {
          setError('Accès refusé')
          return
        }

        setError(message)
        return
      }

      const data = await response.json()
      const list: DocumentItem[] = data.documents || []
      const newTotal: number = data.pagination?.total ?? list.length
      setTotal(newTotal)

      if (reset) {
        setDocuments(list)
        setPage(1)
      } else {
        setDocuments(prev => [...prev, ...list])
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des documents:', err)
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [page, limit, searchQuery, router])

  // Filtrage des documents avec recherche
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents
    
    const searchLower = searchQuery.toLowerCase()
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.currentVersion?.fileName.toLowerCase().includes(searchLower) ||
      doc.description?.toLowerCase().includes(searchLower) ||
      doc.author?.name.toLowerCase().includes(searchLower)
    )
  }, [documents, searchQuery])

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      // Mettre à jour la liste locale
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      // Notifier le reste de l'app (sidebar, pages dossier) de la suppression
      try { window.dispatchEvent(new CustomEvent('data:documents-changed')) } catch {}
      return true
    } catch (err) {
      console.error('Erreur lors de la suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      return false
    }
  }

  const downloadDocument = async (documentItem: DocumentItem): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documents/${documentItem.id}/download`)
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = documentItem.currentVersion?.fileName || 'document'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      return true
    } catch (err) {
      console.error('Erreur téléchargement:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement')
      return false
    }
  }

  const updateDocument = (updatedDocument: DocumentItem) => {
    setDocuments(prev => 
      prev.map(doc => doc.id === updatedDocument.id ? updatedDocument : doc)
    )
  }

  useEffect(() => {
    fetchDocuments({ reset: true, pageParam: 1 })
  }, [])

  // Rechargement quand la recherche change
  useEffect(() => {
    setPage(1)
    fetchDocuments({ reset: true, pageParam: 1 })
  }, [searchQuery, fetchDocuments])

  const refreshData = () => {
    setPage(1)
    fetchDocuments({ reset: true, pageParam: 1 })
  }

  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return
    const next = page + 1
    setPage(next)
    await fetchDocuments({ reset: false, pageParam: next })
  }

  return {
    documents,
    filteredDocuments,
    isLoading,
    isLoadingMore,
    error,
    searchQuery,
    setSearchQuery,
    deleteDocument,
    downloadDocument,
    updateDocument,
    refreshData,
    hasMore,
    loadMore,
    page,
    limit,
    setLimit,
    total
  }
}
