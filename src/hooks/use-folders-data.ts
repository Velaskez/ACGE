import { useState, useEffect, useCallback } from 'react'

interface FolderItem {
  id: string
  folderNumber: string
  name: string
  description?: string
  documentCount: number
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
  }
  recentDocuments?: Array<{
    id: string
    title: string
    fileName: string
    fileType: string
  }>
}

interface CreateFolderData {
  name: string
  description?: string
}

interface UpdateFolderData {
  id: string
  name: string
  description?: string
}

export function useFoldersData() {
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Récupérer tous les dossiers
  const fetchFolders = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/folders')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des dossiers')
      }
      
      const data = await response.json()
      setFolders(data.folders || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error)
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Créer un nouveau dossier
  const createFolder = useCallback(async (folderData: CreateFolderData): Promise<boolean> => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(folderData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création du dossier')
      }

      // Rafraîchir la liste
      await fetchFolders()
      return true
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      throw error
    }
  }, [fetchFolders])

  // Modifier un dossier
  const updateFolder = useCallback(async (folderData: UpdateFolderData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/folders/${folderData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderData.name,
          description: folderData.description
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la modification du dossier')
      }

      // Rafraîchir la liste
      await fetchFolders()
      return true
    } catch (error) {
      console.error('Erreur lors de la modification du dossier:', error)
      throw error
    }
  }, [fetchFolders])

  // Supprimer un dossier
  const deleteFolder = useCallback(async (folderId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la suppression du dossier')
      }

      // Rafraîchir la liste
      await fetchFolders()
      return true
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier:', error)
      throw error
    }
  }, [fetchFolders])

  // Rechercher des dossiers
  const searchFolders = useCallback(async (query: string) => {
    if (!query.trim()) {
      await fetchFolders()
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/folders/search?query=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche')
      }
      
      const data = await response.json()
      setFolders(data.folders || [])
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la recherche')
    } finally {
      setIsLoading(false)
    }
  }, [fetchFolders])

  // Filtrage local des dossiers
  const filteredFolders = folders.filter(folder => {
    if (!searchQuery.trim()) return true
    
    const searchLower = searchQuery.toLowerCase()
    return (
      folder.name.toLowerCase().includes(searchLower) ||
      folder.description?.toLowerCase().includes(searchLower) ||
      folder.folderNumber.toLowerCase().includes(searchLower)
    )
  })

  // Charger les données au montage
  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  // Recherche en temps réel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchFolders(searchQuery)
      } else {
        fetchFolders()
      }
    }, 300) // Délai de 300ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchFolders, fetchFolders])

  return {
    // État
    folders,
    filteredFolders,
    isLoading,
    error,
    searchQuery,
    
    // Actions
    setSearchQuery,
    createFolder,
    updateFolder,
    deleteFolder,
    refreshData: fetchFolders,
  }
}
