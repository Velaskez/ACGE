import { useState, useEffect, useMemo } from 'react'
import { DocumentItem } from '@/types/document'

export function useDocumentsData() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/documents', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des fichiers')
      }
      
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('Erreur lors de la récupération des documents:', err)
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

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
    fetchDocuments()
  }, [])

  const refreshData = () => {
    fetchDocuments()
  }

  return {
    documents,
    filteredDocuments,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    deleteDocument,
    downloadDocument,
    updateDocument,
    refreshData
  }
}
