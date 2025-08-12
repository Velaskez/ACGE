import { useState, useEffect } from 'react'

export interface Folder {
  id: string
  name: string
  description?: string
  parentId?: string
  documentCount?: number
  createdAt: string
  updatedAt: string
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFolders = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/sidebar/folders', { 
        credentials: 'include' 
      })
      
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      } else if (response.status === 401) {
        // Non authentifié - pas d'erreur, juste une liste vide
        setFolders([])
      } else {
        throw new Error(`Erreur ${response.status}`)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des dossiers:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setFolders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  const refresh = () => {
    fetchFolders()
  }

  return {
    folders,
    isLoading,
    error,
    refresh
  }
}
