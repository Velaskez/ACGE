'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationType, NotificationPriority } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Settings,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SortAsc,
  SortDesc,
  Archive,
  Star,
  StarOff,
  Calendar,
  FileText,
  RefreshCw,
  X,
  Check,
  Plus,
  Minus,
} from 'lucide-react'

const notificationTypeConfig = {
  INFO: { icon: Info, color: 'bg-blue-100 text-blue-700', label: 'Information' },
  WARNING: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700', label: 'Avertissement' },
  ERROR: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Erreur' },
  SUCCESS: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Succès' },
  VALIDATION: { icon: CheckCircle, color: 'bg-purple-100 text-purple-700', label: 'Validation' },
  REJECTION: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejet' },
  APPROVAL: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approbation' },
  SYSTEM: { icon: Bell, color: 'bg-gray-100 text-gray-700', label: 'Système' },
}

const priorityConfig = {
  LOW: { color: 'bg-gray-100 text-gray-700', label: 'Faible', order: 1 },
  MEDIUM: { color: 'bg-blue-100 text-blue-700', label: 'Moyenne', order: 2 },
  HIGH: { color: 'bg-orange-100 text-orange-700', label: 'Élevée', order: 3 },
  URGENT: { color: 'bg-red-100 text-red-700', label: 'Urgente', order: 4 },
}

type SortField = 'created_at' | 'priority' | 'type' | 'title'
type SortOrder = 'asc' | 'desc'
type ViewMode = 'list' | 'compact' | 'grouped'

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications,
    stats,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    deleteNotification,
    deleteNotifications,
    clearAllNotifications,
  } = useNotifications()

  // États de base
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL')
  
  // États avancés
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [groupByDate, setGroupByDate] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // États pour les dialogues
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Pagination
  const totalPages = Math.ceil(notifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // Filtrer et trier les notifications
  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'ALL' || notification.type === typeFilter
      const matchesPriority = priorityFilter === 'ALL' || notification.priority === priorityFilter
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'READ' && notification.is_read) ||
                           (statusFilter === 'UNREAD' && !notification.is_read)

      return matchesSearch && matchesType && matchesPriority && matchesStatus
    })

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortField) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'priority':
          aValue = priorityConfig[a.priority]?.order || 0
          bValue = priorityConfig[b.priority]?.order || 0
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [notifications, searchTerm, typeFilter, priorityFilter, statusFilter, sortField, sortOrder])

  // Grouper les notifications par date
  const groupedNotifications = useMemo(() => {
    if (!groupByDate || viewMode !== 'grouped') {
      return { 'Toutes': filteredAndSortedNotifications }
    }

    const groups: { [key: string]: typeof filteredAndSortedNotifications } = {}
    
    filteredAndSortedNotifications.forEach(notification => {
      const date = new Date(notification.created_at)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      let groupKey: string
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Aujourd\'hui'
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Hier'
      } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
        groupKey = 'Cette semaine'
      } else if (date.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000) {
        groupKey = 'Ce mois'
      } else {
        groupKey = date.toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long' 
        })
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(notification)
    })
    
    return groups
  }, [filteredAndSortedNotifications, groupByDate, viewMode])

  // Notifications paginées
  const paginatedNotifications = useMemo(() => {
    if (viewMode === 'grouped') {
      return groupedNotifications
    }
    
    const paginated = filteredAndSortedNotifications.slice(startIndex, endIndex)
    return { 'Notifications': paginated }
  }, [filteredAndSortedNotifications, startIndex, endIndex, groupedNotifications, viewMode])

  // Gestion de la sélection
  const handleSelectAll = useCallback(() => {
    if (selectedNotifications.size === filteredAndSortedNotifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(filteredAndSortedNotifications.map(n => n.id)))
    }
  }, [selectedNotifications.size, filteredAndSortedNotifications])

  const handleSelectNotification = useCallback((notificationId: string) => {
    const newSelected = new Set(selectedNotifications)
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId)
    } else {
      newSelected.add(notificationId)
    }
    setSelectedNotifications(newSelected)
  }, [selectedNotifications])

  // Actions en lot
  const handleBulkMarkAsRead = useCallback(async () => {
    const promises = Array.from(selectedNotifications).map(id => markAsRead(id))
    await Promise.all(promises)
    setSelectedNotifications(new Set())
  }, [selectedNotifications, markAsRead])

  const handleBulkDelete = useCallback(async () => {
    try {
      const notificationIds = Array.from(selectedNotifications)
      const count = await deleteNotifications(notificationIds)
      
      if (count > 0) {
        console.log(`${count} notifications supprimées avec succès`)
        setSelectedNotifications(new Set())
        setShowDeleteDialog(false)
      } else {
        console.error('Aucune notification supprimée')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression en lot:', error)
    }
  }, [selectedNotifications, deleteNotifications])

  // Export
  const handleExport = useCallback(async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    try {
      // TODO: Implémenter l'export
      console.log(`Export ${format}:`, filteredAndSortedNotifications)
      setShowExportDialog(false)
    } finally {
      setIsExporting(false)
    }
  }, [filteredAndSortedNotifications])

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault()
            handleSelectAll()
            break
          case 'r':
            e.preventDefault()
            refreshNotifications()
            break
          case 'e':
            e.preventDefault()
            setShowExportDialog(true)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSelectAll, refreshNotifications])

  // Utilitaires
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`
  }

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    const count = await markAllAsRead()
    console.log(`${count} notifications marquées comme lues`)
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Erreur</CardTitle>
              <CardDescription>
                Impossible de charger les notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={refreshNotifications} className="w-full">
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header amélioré */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Notifications</h1>
            <p className="text-primary text-sm sm:text-base">
              Gérez vos notifications et alertes intelligemment
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={refreshNotifications} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              size="sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mode d'affichage</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={viewMode === 'list'}
                  onCheckedChange={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" />
                  Liste
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={viewMode === 'compact'}
                  onCheckedChange={() => setViewMode('compact')}
                >
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  Compact
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={viewMode === 'grouped'}
                  onCheckedChange={() => setViewMode('grouped')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Groupé
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={groupByDate}
                  onCheckedChange={setGroupByDate}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Grouper par date
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {stats && stats.unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        {/* Statistiques améliorées */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNotifications}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredAndSortedNotifications.length} filtrées
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Non lues</CardTitle>
                <div className="h-4 w-4 rounded-full bg-blue-500"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.unreadCount}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.unreadCount / stats.totalNotifications) * 100)}% du total
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Priorité élevée</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.highPriorityCount}</div>
                <p className="text-xs text-muted-foreground">
                  Nécessitent attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.urgentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Action immédiate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres avancés */}
        {showFilters && (
          <Card className="animate-in slide-in-from-top-2 duration-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Filtres avancés
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recherche</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans les notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as NotificationType | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les types</SelectItem>
                      {Object.entries(notificationTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as NotificationPriority | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes les priorités</SelectItem>
                      {Object.entries(priorityConfig).map(([priority, config]) => (
                        <SelectItem key={priority} value={priority}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'READ' | 'UNREAD')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="UNREAD">Non lues</SelectItem>
                      <SelectItem value="READ">Lues</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="sort-field">Trier par</Label>
                    <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date</SelectItem>
                        <SelectItem value="priority">Priorité</SelectItem>
                        <SelectItem value="type">Type</SelectItem>
                        <SelectItem value="title">Titre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="sort-order">Ordre</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="items-per-page">Par page</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions en lot */}
        {selectedNotifications.size > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} sélectionnée{selectedNotifications.size > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBulkMarkAsRead}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Marquer comme lu
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedNotifications(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Notifications ({filteredAndSortedNotifications.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedNotifications.size === filteredAndSortedNotifications.length ? (
                    <Minus className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {selectedNotifications.size === filteredAndSortedNotifications.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(paginatedNotifications).length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  Aucune notification trouvée
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || typeFilter !== 'ALL' || priorityFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Essayez de modifier vos filtres de recherche'
                    : 'Vous n\'avez pas encore de notifications'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(paginatedNotifications).map(([groupName, groupNotifications]) => (
                  <div key={groupName}>
                    {viewMode === 'grouped' && (
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {groupName} ({groupNotifications.length})
                      </h3>
                    )}
                    <div className="space-y-2">
                      {groupNotifications.map((notification) => {
                        const typeConfig = notificationTypeConfig[notification.type]
                        const priorityConfigItem = priorityConfig[notification.priority]
                        const TypeIcon = typeConfig.icon
                        const isSelected = selectedNotifications.has(notification.id)

                        return (
                          <div
                            key={notification.id}
                            className={`flex items-start space-x-4 p-4 border rounded-lg transition-all duration-200 ${
                              notification.is_read 
                                ? 'bg-muted/30 border-muted' 
                                : 'bg-background border-border hover:bg-muted/50'
                            } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${
                              viewMode === 'compact' ? 'py-2' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleSelectNotification(notification.id)}
                                className="mt-1"
                              />
                              <div className="flex-shrink-0">
                                <div className={`p-2 rounded-full ${typeConfig.color}`}>
                                  <TypeIcon className="h-4 w-4" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h3 className={`text-sm font-medium truncate ${
                                      notification.is_read ? 'text-muted-foreground' : 'text-primary'
                                    }`}>
                                      {notification.title}
                                    </h3>
                                    {!notification.is_read && (
                                      <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className={`text-sm text-muted-foreground mb-2 ${
                                    viewMode === 'compact' ? 'line-clamp-1' : ''
                                  }`}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <span>{getTimeAgo(notification.created_at)}</span>
                                    <span>•</span>
                                    <Badge variant="secondary" className={priorityConfigItem.color}>
                                      {priorityConfigItem.label}
                                    </Badge>
                                    {viewMode !== 'compact' && (
                                      <>
                                        <span>•</span>
                                        <span>{formatDate(notification.created_at)}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.is_read && (
                                      <DropdownMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Marquer comme lu
                                      </DropdownMenuItem>
                                    )}
                                    {notification.action_url && (
                                      <DropdownMenuItem onClick={() => router.push(notification.action_url!)}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {notification.action_label || 'Voir'}
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-red-600"
                                      onClick={() => deleteNotification(notification.id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {viewMode !== 'grouped' && totalPages > 1 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, filteredAndSortedNotifications.length)} sur {filteredAndSortedNotifications.length} notifications
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {/* Pages */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raccourcis clavier */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">
              <strong>Raccourcis clavier :</strong> Ctrl+A (Tout sélectionner), Ctrl+R (Actualiser), Ctrl+E (Exporter)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogues */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer les notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exporter les notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Choisissez le format d'export pour {filteredAndSortedNotifications.length} notification{filteredAndSortedNotifications.length > 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button onClick={() => handleExport('csv')} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={isExporting}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}