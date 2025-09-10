import { randomUUID } from 'crypto'

export interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error' | 'document' | 'folder' | 'user'
  userId: string
  data?: Record<string, any>
}

export interface Notification extends NotificationData {
  id: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// Store notifications in memory (can be replaced with database later)
class NotificationStore {
  private notifications: Map<string, Notification> = new Map()
  private userNotifications: Map<string, Set<string>> = new Map()

  create(notification: NotificationData): Notification {
    const id = randomUUID()
    const now = new Date()
    
    const newNotification: Notification = {
      id,
      ...notification,
      isRead: false,
      createdAt: now,
      updatedAt: now
    }

    this.notifications.set(id, newNotification)
    
    // Track user notifications
    if (!this.userNotifications.has(notification.userId)) {
      this.userNotifications.set(notification.userId, new Set())
    }
    this.userNotifications.get(notification.userId)!.add(id)

    console.log(`📬 Notification créée: ${notification.title} (${id})`)
    return newNotification
  }

  getByUserId(userId: string, limit: number = 50): Notification[] {
    const userNotificationIds = this.userNotifications.get(userId) || new Set()
    const notifications = Array.from(userNotificationIds)
      .map(id => this.notifications.get(id))
      .filter((notification): notification is Notification => notification !== undefined)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)

    return notifications
  }

  markAsRead(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (!notification || notification.userId !== userId) {
      return false
    }

    notification.isRead = true
    notification.updatedAt = new Date()
    this.notifications.set(notificationId, notification)
    
    console.log(`📬 Notification marquée comme lue: ${notificationId}`)
    return true
  }

  markAllAsRead(userId: string): number {
    const userNotificationIds = this.userNotifications.get(userId) || new Set()
    let count = 0

    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId)
      if (notification && !notification.isRead) {
        notification.isRead = true
        notification.updatedAt = new Date()
        this.notifications.set(notificationId, notification)
        count++
      }
    }

    console.log(`📬 ${count} notifications marquées comme lues pour l'utilisateur ${userId}`)
    return count
  }

  delete(notificationId: string, userId: string): boolean {
    const notification = this.notifications.get(notificationId)
    if (!notification || notification.userId !== userId) {
      return false
    }

    this.notifications.delete(notificationId)
    this.userNotifications.get(userId)?.delete(notificationId)
    
    console.log(`📬 Notification supprimée: ${notificationId}`)
    return true
  }

  getUnreadCount(userId: string): number {
    const userNotificationIds = this.userNotifications.get(userId) || new Set()
    let count = 0

    for (const notificationId of userNotificationIds) {
      const notification = this.notifications.get(notificationId)
      if (notification && !notification.isRead) {
        count++
      }
    }

    return count
  }

  // Cleanup old notifications (older than 30 days)
  cleanup(): number {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let deletedCount = 0
    const toDelete: string[] = []

    for (const [id, notification] of this.notifications) {
      if (notification.createdAt < thirtyDaysAgo) {
        toDelete.push(id)
      }
    }

    for (const id of toDelete) {
      const notification = this.notifications.get(id)
      if (notification) {
        this.userNotifications.get(notification.userId)?.delete(id)
        this.notifications.delete(id)
        deletedCount++
      }
    }

    if (deletedCount > 0) {
      console.log(`🧹 ${deletedCount} anciennes notifications supprimées`)
    }

    return deletedCount
  }
}

// Singleton instance
export const notificationStore = new NotificationStore()

// Cleanup every hour
setInterval(() => {
  notificationStore.cleanup()
}, 60 * 60 * 1000)

/**
 * Créer une notification
 */
export async function createNotification(notification: NotificationData): Promise<{ id: string } | null> {
  try {
    const newNotification = notificationStore.create(notification)
    return { id: newNotification.id }
  } catch (error) {
    console.error('❌ Erreur création notification:', error)
    return null
  }
}

/**
 * Récupérer les notifications d'un utilisateur
 */
export async function getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
  try {
    return notificationStore.getByUserId(userId, limit)
  } catch (error) {
    console.error('❌ Erreur récupération notifications:', error)
    return []
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    return notificationStore.markAsRead(notificationId, userId)
  } catch (error) {
    console.error('❌ Erreur marquage notification:', error)
    return false
  }
}

/**
 * Marquer toutes les notifications comme lues
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    return notificationStore.markAllAsRead(userId)
  } catch (error) {
    console.error('❌ Erreur marquage toutes notifications:', error)
    return 0
  }
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    return notificationStore.delete(notificationId, userId)
  } catch (error) {
    console.error('❌ Erreur suppression notification:', error)
    return false
  }
}

/**
 * Récupérer le nombre de notifications non lues
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return notificationStore.getUnreadCount(userId)
  } catch (error) {
    console.error('❌ Erreur comptage notifications:', error)
    return 0
  }
}

/**
 * Notifier tous les admins
 */
export async function notifyAdmins(notification: Omit<NotificationData, 'userId'>): Promise<void> {
  try {
    // Pour l'instant, on simule les admins
    // TODO: Récupérer la vraie liste des admins depuis la base de données
    const adminIds = ['cmebotahv0000c17w3izkh2k9'] // ID admin par défaut
    
    for (const adminId of adminIds) {
      await createNotification({
        ...notification,
        userId: adminId
      })
    }
    
    console.log(`📬 ${adminIds.length} admins notifiés: ${notification.title}`)
  } catch (error) {
    console.error('❌ Erreur notification admins:', error)
  }
}

/**
 * Notifications d'événements documents
 */
export const DocumentNotifications = {
  created: async (documentId: string, title: string, userId: string) => {
    await createNotification({
      title: 'Document créé',
      message: `Le document "${title}" a été créé avec succès`,
      type: 'document',
      userId,
      data: { documentId, action: 'created' }
    })
  },

  updated: async (documentId: string, title: string, userId: string) => {
    await createNotification({
      title: 'Document modifié',
      message: `Le document "${title}" a été modifié`,
      type: 'document',
      userId,
      data: { documentId, action: 'updated' }
    })
  },

  deleted: async (documentId: string, title: string, userId: string) => {
    await createNotification({
      title: 'Document supprimé',
      message: `Le document "${title}" a été supprimé`,
      type: 'document',
      userId,
      data: { documentId, action: 'deleted' }
    })
  },

  moved: async (documentId: string, title: string, folderName: string, userId: string) => {
    await createNotification({
      title: 'Document déplacé',
      message: `Le document "${title}" a été déplacé vers "${folderName}"`,
      type: 'document',
      userId,
      data: { documentId, folderName, action: 'moved' }
    })
  }
}

/**
 * Notifications d'événements dossiers
 */
export const FolderNotifications = {
  created: async (folderId: string, name: string, userId: string) => {
    await createNotification({
      title: 'Dossier créé',
      message: `Le dossier "${name}" a été créé avec succès`,
      type: 'folder',
      userId,
      data: { folderId, action: 'created' }
    })
  },

  updated: async (folderId: string, name: string, userId: string) => {
    await createNotification({
      title: 'Dossier modifié',
      message: `Le dossier "${name}" a été modifié`,
      type: 'folder',
      userId,
      data: { folderId, action: 'updated' }
    })
  },

  deleted: async (folderId: string, name: string, userId: string) => {
    await createNotification({
      title: 'Dossier supprimé',
      message: `Le dossier "${name}" a été supprimé`,
      type: 'folder',
      userId,
      data: { folderId, action: 'deleted' }
    })
  }
}
