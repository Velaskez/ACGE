import { prisma } from './db'
import type { NotificationType } from '@/types'

interface CreateNotificationData {
  type: NotificationType
  title: string
  message: string
  userId: string
  data?: any
}

export class NotificationService {
  /**
   * Créer une nouvelle notification
   */
  static async create(notificationData: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          userId: notificationData.userId,
          data: notificationData.data || null
        }
      })
      
      console.log(`Notification créée: ${notification.type} pour utilisateur ${notification.userId}`)
      return notification
    } catch (error) {
      console.error('Erreur lors de la création de notification:', error)
      return null
    }
  }

  /**
   * Créer des notifications en lot
   */
  static async createMany(notifications: CreateNotificationData[]) {
    try {
      const result = await prisma.notification.createMany({
        data: notifications.map(n => ({
          type: n.type,
          title: n.title,
          message: n.message,
          userId: n.userId,
          data: n.data || null
        }))
      })
      
      console.log(`${result.count} notifications créées en lot`)
      return result
    } catch (error) {
      console.error('Erreur lors de la création de notifications en lot:', error)
      return null
    }
  }

  /**
   * Notification pour partage de document
   */
  static async notifyDocumentShared(documentId: string, documentTitle: string, sharedByUserId: string, sharedWithUserId: string, permission: string) {
    const sharedByUser = await prisma.user.findUnique({
      where: { id: sharedByUserId },
      select: { name: true }
    })

    return this.create({
      type: 'DOCUMENT_SHARED',
      title: 'Document partagé avec vous',
      message: `${sharedByUser?.name || 'Un utilisateur'} a partagé le document "${documentTitle}" avec vous (${permission.toLowerCase()}).`,
      userId: sharedWithUserId,
      data: {
        documentId,
        documentTitle,
        sharedByUserId,
        permission
      }
    })
  }

  /**
   * Notification pour nouvelle version de document
   */
  static async notifyVersionAdded(documentId: string, documentTitle: string, versionNumber: number, createdByUserId: string, sharedWithUserIds: string[]) {
    const createdByUser = await prisma.user.findUnique({
      where: { id: createdByUserId },
      select: { name: true }
    })

    const notifications = sharedWithUserIds
      .filter(userId => userId !== createdByUserId) // Ne pas notifier l'auteur
      .map(userId => ({
        type: 'VERSION_ADDED' as NotificationType,
        title: 'Nouvelle version disponible',
        message: `${createdByUser?.name || 'Un utilisateur'} a ajouté la version ${versionNumber} du document "${documentTitle}".`,
        userId,
        data: {
          documentId,
          documentTitle,
          versionNumber,
          createdByUserId
        }
      }))

    if (notifications.length > 0) {
      return this.createMany(notifications)
    }
  }

  /**
   * Notification pour restauration de version
   */
  static async notifyVersionRestored(documentId: string, documentTitle: string, versionNumber: number, restoredByUserId: string, sharedWithUserIds: string[]) {
    const restoredByUser = await prisma.user.findUnique({
      where: { id: restoredByUserId },
      select: { name: true }
    })

    const notifications = sharedWithUserIds
      .filter(userId => userId !== restoredByUserId) // Ne pas notifier l'auteur
      .map(userId => ({
        type: 'VERSION_RESTORED' as NotificationType,
        title: 'Version restaurée',
        message: `${restoredByUser?.name || 'Un utilisateur'} a restauré la version ${versionNumber} du document "${documentTitle}".`,
        userId,
        data: {
          documentId,
          documentTitle,
          versionNumber,
          restoredByUserId
        }
      }))

    if (notifications.length > 0) {
      return this.createMany(notifications)
    }
  }

  /**
   * Notification de bienvenue pour nouveaux utilisateurs
   */
  static async notifyWelcome(userId: string, userName: string) {
    return this.create({
      type: 'WELCOME',
      title: 'Bienvenue dans ACGE !',
      message: `Bonjour ${userName} ! Vous pouvez maintenant commencer à gérer vos documents, créer des dossiers et collaborer avec votre équipe.`,
      userId,
      data: {
        version: '1.0.0',
        features: ['documents', 'folders', 'sharing', 'versions']
      }
    })
  }

  /**
   * Notification système
   */
  static async notifySystem(userIds: string[], title: string, message: string, data?: any) {
    const notifications = userIds.map(userId => ({
      type: 'SYSTEM' as NotificationType,
      title,
      message,
      userId,
      data
    }))

    return this.createMany(notifications)
  }

  /**
   * Récupérer les utilisateurs qui ont accès à un document (pour notifications)
   */
  static async getDocumentAccessUsers(documentId: string): Promise<string[]> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        author: { select: { id: true } },
        shares: { select: { userId: true } }
      }
    })

    if (!document) return []

    const userIds = [document.author.id, ...document.shares.map(share => share.userId)]
    return [...new Set(userIds)] // Supprimer les doublons
  }
}
