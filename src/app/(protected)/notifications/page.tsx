'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { formatRelativeTime } from '@/lib/utils'
import {
  Bell,
  Check,
  CheckCheck,
  Filter,
  FileText,
  Share2,
  RotateCcw,
  User,
  Settings,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchNotifications()
  }, [filter, pagination.page])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter === 'unread' && { unreadOnly: 'true' })
      })

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0
        }))
      } else {
        setError('Erreur lors du chargement des notifications')
      }
    } catch (err) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: false })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      }
    } catch (error) {
      console.error('Erreur lors du marquage global:', error)
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'DOCUMENT_SHARED':
        return <Share2 className="h-5 w-5 text-blue-500" />
      case 'VERSION_ADDED':
        return <FileText className="h-5 w-5 text-green-500" />
      case 'VERSION_RESTORED':
        return <RotateCcw className="h-5 w-5 text-orange-500" />
      case 'WELCOME':
        return <User className="h-5 w-5 text-purple-500" />
      case 'SYSTEM':
        return <Settings className="h-5 w-5 text-gray-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'DOCUMENT_SHARED': return 'Partage'
      case 'VERSION_ADDED': return 'Nouvelle version'
      case 'VERSION_RESTORED': return 'Version restaurée'
      case 'WELCOME': return 'Bienvenue'
      case 'SYSTEM': return 'Système'
      default: return 'Notification'
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marquer comme lu
    if (!notification.isRead) {
      markAsRead(notification.id)
    }

    // Navigation contextuelle
    if (notification.data?.documentId) {
      window.location.href = `/documents?view=${notification.data.documentId}`
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <MainLayout
      title="Notifications"
      description="Consultez vos notifications et restez informé des dernières activités"
      icon={Bell}
    >
      <div className="space-y-6">
        {/* En-tête avec actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('all')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                Toutes ({pagination.total})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFilter('unread')
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
              >
                Non lues ({unreadCount})
              </Button>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} size="sm" className="self-start">
              <CheckCheck className="mr-2 h-4 w-4" />
              Marquer tout comme lu
            </Button>
          )}
        </div>

        {/* Messages d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Liste des notifications */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-muted-foreground text-center">
                {filter === 'unread' 
                  ? 'Toutes vos notifications ont été lues !'
                  : 'Vous n\'avez pas encore de notifications.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.isRead && (
                              <Badge variant="destructive" className="text-xs">
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.createdAt.toString())}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsUnread(notification.id)
                              }}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages}
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
