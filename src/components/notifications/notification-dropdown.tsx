'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils'
import {
  Bell,
  BellDot,
  Check,
  CheckCheck,
  FileText,
  Share2,
  RotateCcw,
  User,
  Settings,
  Trash2,
  AlertCircle,
  Loader2,
  MessageSquare,
  FolderOpen,
  Crown,
  Wrench
} from 'lucide-react'
import type { Notification, NotificationType } from '@/types'

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Polling pour les nouvelles notifications (toutes les 30 secondes)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    // Fetch initial count
    fetchUnreadCount()

    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true&limit=1')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du compteur:', error)
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
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
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
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Erreur lors du marquage global:', error)
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = "h-4 w-4"
    
    switch (type) {
      case 'WELCOME':
        return <User className={`${iconClass} text-primary`} />
      case 'DOCUMENT_SHARED':
        return <Share2 className={`${iconClass} text-primary`} />
      case 'VERSION_ADDED':
        return <FileText className={`${iconClass} text-primary`} />
      case 'VERSION_RESTORED':
        return <RotateCcw className={`${iconClass} text-primary`} />
      case 'DOCUMENT_DELETED':
        return <Trash2 className={`${iconClass} text-destructive`} />
      case 'FOLDER_SHARED':
        return <FolderOpen className={`${iconClass} text-primary`} />
      case 'COMMENT_ADDED':
        return <MessageSquare className={`${iconClass} text-primary`} />
      case 'SYSTEM':
        return <Wrench className={`${iconClass} text-muted-foreground`} />
      default:
        return <AlertCircle className={`${iconClass} text-muted-foreground`} />
    }
  }

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'WELCOME': return 'Bienvenue'
      case 'DOCUMENT_SHARED': return 'Partage'
      case 'VERSION_ADDED': return 'Nouvelle version'
      case 'VERSION_RESTORED': return 'Version restaurée'
      case 'DOCUMENT_DELETED': return 'Suppression'
      case 'FOLDER_SHARED': return 'Dossier partagé'
      case 'COMMENT_ADDED': return 'Commentaire'
      case 'SYSTEM': return 'Système'
      default: return 'Notification'
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // Marquer comme lu
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }

    // Navigation contextuelle basée sur le type
    if (notification.data?.documentId) {
      window.location.href = `/documents?view=${notification.data.documentId}`
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <div className="relative">
            {unreadCount > 0 ? (
              <BellDot className="h-4 w-4" />
            ) : (
              <Bell className="h-4 w-4" />
            )}
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs min-w-[20px]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="text-base font-semibold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-2"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        
        <Separator />

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-3 text-sm text-muted-foreground">Chargement...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Aucune notification</p>
              <p className="text-xs text-muted-foreground mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
                    !notification.isRead 
                      ? 'bg-primary/5 border-l-2 border-l-primary' 
                      : 'border-l-2 border-l-transparent'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icône */}
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="p-2 rounded-lg bg-accent/50">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* En-tête avec titre et badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium leading-tight ${
                              !notification.isRead ? 'text-foreground' : 'text-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge 
                              variant="secondary" 
                              className="text-xs mt-1.5 bg-muted text-muted-foreground"
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                          
                          {/* Bouton marquer comme lu */}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Message */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Timestamp */}
                        <p className="text-xs text-muted-foreground/70">
                          {formatRelativeTime(notification.createdAt.toString())}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button 
                variant="ghost" 
                className="w-full text-sm h-auto py-2"
                onClick={() => window.location.href = '/notifications'}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
