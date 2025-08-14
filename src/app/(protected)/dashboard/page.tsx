'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import type { DashboardStats, DashboardActivity } from '@/hooks/use-dashboard-data'
import { formatFileSize, formatRelativeTime, getFileTypeLabel } from '@/lib/utils'
import { 
  FileText, 
  FolderOpen, 
  Users, 
  Upload, 
  TrendingUp, 
  Clock,
  Eye,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { stats, activity, isLoading, error, refreshData } = useDashboardData()

  const handleNewDocument = () => {
    router.push('/upload')
  }

  const handleNewFolder = () => {
    // TODO: Implémenter la création de dossier
    console.log('Créer un nouveau dossier')
  }

  const handleShare = () => {
    // TODO: Implémenter le partage
    console.log('Partager des documents')
  }

  const handleHistory = () => {
    // TODO: Implémenter l'historique
    console.log('Afficher l\'historique')
  }

  const handleViewAllDocuments = () => {
    router.push('/documents')
  }

  const handleViewUsers = () => {
    router.push('/users')
  }

  const handleDownloadDocument = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = fileName || 'document'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Erreur lors du téléchargement')
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  const handleViewDocument = (documentId: string) => {
    router.push(`/documents?view=${documentId}`)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de vos fichiers et activités
            </p>
          </div>
          <div className="flex gap-2">
            {error && (
              <Button variant="outline" size="sm" onClick={refreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            )}
            <Button onClick={handleNewDocument}>
              <Upload className="mr-2 h-4 w-4" />
              Nouveau document
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">
                  Erreur lors du chargement des données: {error}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleViewAllDocuments}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fichiers</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalDocuments?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.monthlyGrowthPercentage ? (
                      stats.monthlyGrowthPercentage > 0 ? 
                        `+${stats.monthlyGrowthPercentage}% par rapport au mois dernier` :
                        stats.monthlyGrowthPercentage < 0 ?
                          `${stats.monthlyGrowthPercentage}% par rapport au mois dernier` :
                          'Aucune évolution ce mois'
                    ) : 'Pas de données historiques'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossiers</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalFolders?.toLocaleString() || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.documentsThisMonth ? 
                      `+${stats.documentsThisMonth} nouveaux ce mois` : 
                      'Aucun nouveau ce mois'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {stats?.spaceUsed ? `${stats.spaceUsed.gb} GB` : '0 GB'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.spaceUsed ? 
                      `${stats.spaceUsed.percentage}% de votre quota` : 
                      '0% de votre quota'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleViewUsers}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers ? 
                      `${stats.activeUsers} en ligne récemment` : 
                      'Aucun utilisateur actif'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Documents récents */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fichiers récents</CardTitle>
                  <CardDescription>
                    Vos derniers fichiers ajoutés ou modifiés
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleViewAllDocuments}>
                  Voir tous
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <Skeleton className="w-8 h-8 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  ))
                ) : stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
                  stats.recentDocuments.map((doc: DashboardStats['recentDocuments'][number]) => (
                    <div key={doc.id} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-powder-blue/20 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-powder-blue" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{doc.title || doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(doc.updatedAt)} • {formatFileSize(doc.size)} • {getFileTypeLabel(doc.type)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc.id)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Voir le document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id, doc.name)}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Télécharger</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">Aucun document</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Commencez par télécharger votre premier document.
                    </p>
                    <div className="mt-6">
                      <Button onClick={handleNewDocument}>
                        <Upload className="mr-2 h-4 w-4" />
                        Télécharger un document
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activité récente */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Dernières actions sur vos fichiers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Skeleton className="w-2 h-2 rounded-full mt-2" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))
                ) : activity?.activities && activity.activities.length > 0 ? (
                  activity.activities.map((act: DashboardActivity['activities'][number]) => (
                    <div key={act.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-powder-blue rounded-full mt-2"></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{act.action}</p>
                        <p className="text-xs text-muted-foreground">{act.target}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium text-muted-foreground">Aucune activité</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vos activités récentes apparaîtront ici.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accédez rapidement aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col" onClick={handleNewDocument}>
                <Upload className="h-6 w-6 mb-2" />
                <span>Upload</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleNewFolder}>
                <FolderOpen className="h-6 w-6 mb-2" />
                <span>Nouveau dossier</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleShare}>
                <Users className="h-6 w-6 mb-2" />
                <span>Partager</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={handleHistory}>
                <Clock className="h-6 w-6 mb-2" />
                <span>Historique</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
