import { useState, useEffect } from 'react'

export interface SidebarStats {
  totalDocuments: number
  totalFolders: number
  spaceUsed: {
    gb: number
  }
}

export interface SidebarFolder {
  id: string
  name: string
  documentCount: number
  recentDocuments: Array<{
    id: string
    title: string
    fileName: string
    fileType: string
  }>
}

export function useSidebarData() {
  const [stats, setStats] = useState<SidebarStats | null>(null)
  const [folders, setFolders] = useState<SidebarFolder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setIsLoading(true)
        
        // Récupérer les statistiques du dashboard (réutilisation)
        const [statsResponse, foldersResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/sidebar/folders')
        ])

        if (!statsResponse.ok) {
          throw new Error('Erreur lors de la récupération des statistiques')
        }

        const statsData = await statsResponse.json()
        
        // Extraire seulement les données nécessaires pour la sidebar
        setStats({
          totalDocuments: statsData.totalDocuments,
          totalFolders: statsData.totalFolders,
          spaceUsed: {
            gb: statsData.spaceUsed?.gb || 0
          }
        })

        // Si l'API folders existe, l'utiliser, sinon utiliser un fallback
        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json()
          setFolders(foldersData.folders || [])
        } else {
          // Fallback avec dossiers par défaut si l'API n'existe pas encore
          setFolders([])
        }

        setError(null)
      } catch (err) {
        console.error('Erreur sidebar:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
        // En cas d'erreur, utiliser des valeurs par défaut
        setStats({
          totalDocuments: 0,
          totalFolders: 0,
          spaceUsed: { gb: 0 }
        })
        setFolders([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSidebarData()
  }, [])

  return {
    stats,
    folders,
    isLoading,
    error
  }
}
