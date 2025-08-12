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

  const fetchSidebarData = async () => {
    try {
      setIsLoading(true)
      
      const [statsResponse, foldersResponse] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch('/api/sidebar/folders', { credentials: 'include' })
      ])

      if (statsResponse.status === 401) {
        // Non authentifié: valeurs par défaut, pas d'exception pour éviter le crash UI
        setStats({ totalDocuments: 0, totalFolders: 0, spaceUsed: { gb: 0 } })
        setFolders([])
        setError(null)
        return
      }

      if (!statsResponse.ok) {
        const errorData = await statsResponse.text()
        console.error('Stats API error:', statsResponse.status, errorData)
        throw new Error(`Erreur lors de la récupération des statistiques: ${statsResponse.status}`)
      }

      const statsData = await statsResponse.json()
      setStats({
        totalDocuments: statsData.totalDocuments,
        totalFolders: statsData.totalFolders,
        spaceUsed: { gb: statsData.spaceUsed?.gb || 0 }
      })

      if (foldersResponse.ok) {
        const foldersData = await foldersResponse.json()
        setFolders(foldersData.folders || [])
      } else {
        setFolders([])
      }

      setError(null)
    } catch (err) {
      console.error('Erreur sidebar:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setStats({ totalDocuments: 0, totalFolders: 0, spaceUsed: { gb: 0 } })
      setFolders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSidebarData()
  }, [])

  return {
    stats,
    folders,
    isLoading,
    error,
    refresh: fetchSidebarData
  }
}
