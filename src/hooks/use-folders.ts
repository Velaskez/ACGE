import { useState, useEffect } from 'react'
import { Folder } from '@/types/folder'

export interface FoldersStats {
  totalFolders: number
  totalDocuments: number
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [stats, setStats] = useState<FoldersStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/folders', { 
        credentials: 'include' 
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Folders API error:', response.status, errorData)
        throw new Error(`Erreur lors de la récupération des dossiers: ${response.status}`)
      }

      const data = await response.json()
      // Ajouter documentCount basé sur _count.documents
      const foldersWithCount = (data.folders || []).map((folder: any) => ({
        ...folder,
        documentCount: folder._count?.documents || 0
      }))
      setFolders(foldersWithCount)
      
      // Calculer les stats
      const totalFolders = data.folders?.length || 0
      const totalDocuments = data.folders?.reduce((sum: number, folder: Folder) => 
        sum + (folder._count?.documents || 0), 0) || 0
      
      setStats({ totalFolders, totalDocuments })

    } catch (err) {
      console.error('Erreur récupération dossiers:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setFolders([])
      setStats({ totalFolders: 0, totalDocuments: 0 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  return {
    folders,
    stats,
    isLoading,
    error,
    refresh: fetchFolders
  }
}
