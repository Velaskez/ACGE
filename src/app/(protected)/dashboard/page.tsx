'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/supabase-auth-context'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import type { DashboardStats, DashboardActivity } from '@/hooks/use-dashboard-data'
import { formatFileSize, formatRelativeTime, getFileTypeLabel } from '@/lib/utils'
import { redirectByRole, getRoleRedirectPath } from '@/lib/role-redirect'
import { useEffect } from 'react'
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
  RefreshCw,
  CheckCircle,
  FileCheck,
  Calculator,
  Shield,
  ArrowRight,
  Home,
  XCircle
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useSupabaseAuth()
  const { stats, activity, isLoading, error, refreshData } = useDashboardData()

  // Redirection automatique basée sur le rôle
  useEffect(() => {
    console.log('🔍 Dashboard useEffect - authLoading:', authLoading, 'user:', user)
    
    if (!authLoading && user && user.role) {
      console.log(`👤 Utilisateur connecté: ${user.name} (${user.role})`)
      
      // Seuls les admins restent sur cette page
      if (user.role !== 'ADMIN') {
        console.log(`🔀 Redirection ${user.role} vers page spécialisée`)
        
        // Forcer la redirection immédiatement
        const redirectPath = getRoleRedirectPath(user.role)
        console.log(`🎯 Redirection vers: ${redirectPath}`)
        
        // Utiliser window.location pour forcer la redirection
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath
        } else {
          redirectByRole(user.role, router)
        }
      } else {
        console.log(`✅ Admin reste sur dashboard`)
      }
    } else {
      console.log('⏳ En attente du chargement ou utilisateur non connecté')
    }
  }, [user, authLoading, router])

  // Afficher un message de chargement pendant la redirection
  if (!authLoading && user && user.role && user.role !== 'ADMIN') {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Redirection vers votre interface...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleNewDocument = () => {
    router.push('/upload')
  }

  const handleNewFolder = () => {
    router.push('/folders')
  }

  const handleShare = () => {
    router.push('/documents')
  }

  const handleHistory = () => {
    router.push('/documents')
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

  // Configuration selon le rôle
  const getRoleConfig = () => {
    switch (user?.role) {
      case 'ADMIN':
        return {
          title: 'Tableau de bord Administrateur',
          description: 'Gestion globale du système et des utilisateurs',
          primaryAction: { label: 'Gérer les utilisateurs', action: () => router.push('/users'), icon: Users },
          quickActions: [
            { label: 'Tableau de bord', action: () => router.push('/dashboard'), icon: Home, color: 'blue' },
            { label: 'Utilisateurs', action: () => router.push('/users'), icon: Users, color: 'red' },
            { label: 'Documents', action: () => router.push('/documents'), icon: FileText, color: 'green' },
            { label: 'Upload', action: () => router.push('/upload'), icon: Upload, color: 'purple' }
          ]
        }
      case 'SECRETAIRE':
        return {
          title: 'Tableau de bord Secrétaire',
          description: 'Gestion des dossiers et documents',
          primaryAction: { label: 'Mes fichiers', action: () => router.push('/documents'), icon: FileText },
          quickActions: [
            { label: 'Dossiers rejetés', action: () => router.push('/secretaire-rejected'), icon: XCircle, color: 'red' },
            { label: 'Mes fichiers', action: () => router.push('/documents'), icon: FileText, color: 'green' },
            { label: 'Upload', action: () => router.push('/upload'), icon: Upload, color: 'purple' },
            { label: 'Dossiers', action: () => router.push('/folders'), icon: FolderOpen, color: 'orange' }
          ]
        }
      case 'CONTROLEUR_BUDGETAIRE':
        return {
          title: 'Tableau de bord Contrôleur Budgétaire',
          description: 'Validation des dossiers en attente',
          primaryAction: { label: 'Validation CB', action: () => router.push('/cb-dashboard'), icon: CheckCircle },
          quickActions: [
            { label: 'Validation CB', action: () => router.push('/cb-dashboard'), icon: CheckCircle, color: 'emerald' },
            { label: 'Dossiers rejetés', action: () => router.push('/cb-rejected'), icon: XCircle, color: 'red' },
            { label: 'Documents', action: () => router.push('/documents'), icon: FileText, color: 'green' }
          ]
        }
      case 'ORDONNATEUR':
        return {
          title: 'Tableau de bord Ordonnateur',
          description: 'Ordonnancement des dépenses validées',
          primaryAction: { label: 'Ordonnancement', action: () => router.push('/ordonnateur-dashboard'), icon: FileCheck },
          quickActions: [
            { label: 'Ordonnancement', action: () => router.push('/ordonnateur-dashboard'), icon: FileCheck, color: 'blue' },
            { label: 'Documents', action: () => router.push('/documents'), icon: FileText, color: 'green' }
          ]
        }
      case 'AGENT_COMPTABLE':
        return {
          title: 'Tableau de bord Agent Comptable',
          description: 'Comptabilisation des paiements',
          primaryAction: { label: 'Comptabilisation', action: () => router.push('/ac-dashboard'), icon: Calculator },
          quickActions: [
            { label: 'Comptabilisation', action: () => router.push('/ac-dashboard'), icon: Calculator, color: 'purple' },
            { label: 'Documents', action: () => router.push('/documents'), icon: FileText, color: 'green' }
          ]
        }
      default:
        return {
          title: 'Tableau de bord',
          description: 'Vue d\'ensemble de vos fichiers et activités',
          primaryAction: { label: 'Nouveau document', action: handleNewDocument, icon: Upload },
          quickActions: [
            { label: 'Documents', action: () => router.push('/documents'), icon: FileText, color: 'green' },
            { label: 'Upload', action: () => router.push('/upload'), icon: Upload, color: 'purple' },
            { label: 'Dossiers', action: () => router.push('/folders'), icon: FolderOpen, color: 'orange' }
          ]
        }
    }
  }

  const roleConfig = getRoleConfig()

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">{roleConfig.title}</h1>
            <p className="text-primary text-sm sm:text-base">
              {roleConfig.description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {error && (
              <Button variant="outline" size="sm" onClick={refreshData} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            )}
            <Button onClick={roleConfig.primaryAction.action} className="w-full sm:w-auto">
              <roleConfig.primaryAction.icon className="mr-2 h-4 w-4" />
              {roleConfig.primaryAction.label}
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">
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
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="h-4 w-4 icon-red-fg" />
              </div>
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
                  <p className="text-xs text-primary">
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

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push('/folders')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dossiers</CardTitle>
              <div className="p-2 bg-muted rounded-lg">
                <FolderOpen className="h-4 w-4 icon-orange-fg" />
              </div>
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
                  <p className="text-xs text-primary">
                    {stats?.documentsThisMonth ? 
                      `+${stats.documentsThisMonth} nouveaux ce mois` : 
                      'Aucun nouveau ce mois'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push('/documents')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Espace utilisé</CardTitle>
              <div className="p-2 bg-muted rounded-lg">
                <TrendingUp className="h-4 w-4 icon-blue-fg" />
              </div>
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
                  <p className="text-xs text-primary">
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
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <div className="p-2 bg-muted rounded-lg">
                <Users className="h-4 w-4 icon-purple-fg" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</div>
                  <p className="text-xs text-primary">
                    {stats?.activeUsers ? 
                      `${stats.activeUsers} actifs ce mois` : 
                      'Aucun utilisateur actif'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role-specific information */}
        {(user?.role === 'CONTROLEUR_BUDGETAIRE' || user?.role === 'ORDONNATEUR' || user?.role === 'AGENT_COMPTABLE') && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                Interface spécialisée
              </CardTitle>
              <CardDescription className="text-blue-700">
                {user?.role === 'CONTROLEUR_BUDGETAIRE' && 'Accédez à votre interface de validation des dossiers'}
                {user?.role === 'ORDONNATEUR' && 'Accédez à votre interface d\'ordonnancement des dépenses'}
                {user?.role === 'AGENT_COMPTABLE' && 'Accédez à votre interface de comptabilisation des paiements'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={roleConfig.primaryAction.action}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <roleConfig.primaryAction.icon className="mr-2 h-4 w-4" />
                {roleConfig.primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

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
                        <p className="text-xs text-primary">
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
                    <FileText className="mx-auto h-12 w-12 icon-red-fg" />
                    <h3 className="mt-2 text-sm font-medium text-primary">Aucun document</h3>
                    <p className="mt-1 text-sm text-primary">
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
                        <p className="text-xs text-primary">{act.target}</p>
                        <p className="text-xs text-primary">{formatRelativeTime(act.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-8 w-8 icon-blue-fg" />
                    <h3 className="mt-2 text-sm font-medium text-primary">Aucune activité</h3>
                    <p className="mt-1 text-xs text-primary">
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
              Accédez rapidement aux fonctionnalités de votre rôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {roleConfig.quickActions.map((action, index) => {
                const getColorClasses = (color: string) => {
                  switch (color) {
                    case 'red': return 'icon-red-fg'
                    case 'green': return 'icon-green-fg'
                    case 'purple': return 'icon-purple-fg'
                    case 'orange': return 'icon-orange-fg'
                    case 'blue': return 'icon-blue-fg'
                    case 'emerald': return 'text-emerald-600'
                    default: return 'text-muted-foreground'
                  }
                }
                
                return (
                  <Button 
                    key={index}
                    variant="outline" 
                    className="h-20 flex-col hover:bg-accent/50 transition-colors" 
                    onClick={action.action}
                  >
                    <action.icon className={`h-6 w-6 mb-2 ${getColorClasses(action.color)}`} />
                    <span>{action.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
