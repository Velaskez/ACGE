import { useState, useEffect } from 'react'

export interface DashboardStats {
  totalDocuments: number
  totalFolders: number
  totalUsers: number
  activeUsers: number
  monthlyGrowthPercentage: number
  spaceUsed: {
    bytes: number
    gb: number
    percentage: number
    quota: number
  }
  recentDocuments: Array<{
    id: string
    name: string
    title: string
    size: number
    type: string
    createdAt: string
    updatedAt: string
    author: {
      name: string | null
      email: string
    }
    folder: {
      name: string
    } | null
  }>
  documentsThisMonth: number
  documentsLastMonth: number
}

export interface DashboardActivity {
  activities: Array<{
    id: string
    type: string
    action: string
    target: string
    targetId: string
    timestamp: string
    metadata: {
      fileType?: string
    }
  }>
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<DashboardActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Récupérer les statistiques et l'activité en parallèle
        const [statsResponse, activityResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/activity')
        ])

        if (!statsResponse.ok || !activityResponse.ok) {
          throw new Error('Erreur lors de la récupération des données')
        }

        const [statsData, activityData] = await Promise.all([
          statsResponse.json(),
          activityResponse.json()
        ])

        setStats(statsData)
        setActivity(activityData)
        setError(null)
      } catch (err) {
        console.error('Erreur dashboard:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity')
      ])

      if (!statsResponse.ok || !activityResponse.ok) {
        throw new Error('Erreur lors de la récupération des données')
      }

      const [statsData, activityData] = await Promise.all([
        statsResponse.json(),
        activityResponse.json()
      ])

      setStats(statsData)
      setActivity(activityData)
      setError(null)
    } catch (err) {
      console.error('Erreur refresh dashboard:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    stats,
    activity,
    isLoading,
    error,
    refreshData
  }
}
