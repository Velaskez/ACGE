import { getSupabaseAdmin } from './supabase-server'
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
      const admin = getSupabaseAdmin()
      const { data: notification, error } = await admin
        .from('notifications')
        .insert({
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          user_id: notificationData.userId,
          data: notificationData.data || null
        })
        .select()
        .single()
      
      if (error) {
        console.error('Erreur création notification:', error)
        return null
      }
      
      console.log(`Notification créée: ${notification.type} pour utilisateur ${notification.user_id}`)
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
      const admin = getSupabaseAdmin()
      const { data: createdNotifications, error } = await admin
        .from('notifications')
        .insert(notifications.map(n => ({
          type: n.type,
          title: n.title,
          message: n.message,
          user_id: n.userId,
          data: n.data || null
        })))
        .select()
      
      if (error) {
        console.error('Erreur création notifications en lot:', error)
        return null
      }
      
      console.log(`${createdNotifications?.length || 0} notifications créées en lot`)
      return { count: createdNotifications?.length || 0 }
    } catch (error) {
      console.error('Erreur lors de la création en lot:', error)
      return null
    }
  }

  /**
   * Notification de bienvenue
   */
  static async notifyWelcome(userId: string, userName: string) {
    return this.create({
      type: 'WELCOME',
      title: 'Bienvenue sur ACGE !',
      message: `Bonjour ${userName}, votre compte a été créé avec succès. Vous pouvez maintenant commencer à utiliser la plateforme de gestion documentaire.`,
      userId,
      data: { 
        version: '1.0.0',
        userName,
        welcomeDate: new Date().toISOString()
      }
    })
  }

  /**
   * Notification pour partage de document
   */
  static async notifyDocumentShared(documentId: string, documentTitle: string, sharedByUserId: string, sharedWithUserId: string, permission: string) {
    const admin = getSupabaseAdmin()
    const { data: sharedByUser } = await admin
      .from('users')
      .select('name')
      .eq('id', sharedByUserId)
      .maybeSingle()

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
    const admin = getSupabaseAdmin()
    const { data: createdByUser } = await admin
      .from('users')
      .select('name')
      .eq('id', createdByUserId)
      .maybeSingle()

    const notifications = sharedWithUserIds.map(userId => ({
      type: 'VERSION_ADDED' as NotificationType,
      title: 'Nouvelle version disponible',
      message: `${createdByUser?.name || 'Un utilisateur'} a ajouté une nouvelle version (v${versionNumber}) au document "${documentTitle}".`,
      userId,
      data: {
        documentId,
        documentTitle,
        versionNumber,
        createdByUserId
      }
    }))

    return this.createMany(notifications)
  }

  /**
   * Notification pour version restaurée
   */
  static async notifyVersionRestored(documentId: string, documentTitle: string, versionNumber: number, restoredByUserId: string, sharedWithUserIds: string[]) {
    const admin = getSupabaseAdmin()
    const { data: restoredByUser } = await admin
      .from('users')
      .select('name')
      .eq('id', restoredByUserId)
      .maybeSingle()

    const notifications = sharedWithUserIds.map(userId => ({
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

    return this.createMany(notifications)
  }

  /**
   * Notification pour suppression de document
   */
  static async notifyDocumentDeleted(documentTitle: string, deletedByUserId: string, sharedWithUserIds: string[]) {
    const admin = getSupabaseAdmin()
    const { data: deletedByUser } = await admin
      .from('users')
      .select('name')
      .eq('id', deletedByUserId)
      .maybeSingle()

    const notifications = sharedWithUserIds.map(userId => ({
      type: 'DOCUMENT_DELETED' as NotificationType,
      title: 'Document supprimé',
      message: `${deletedByUser?.name || 'Un utilisateur'} a supprimé le document "${documentTitle}".`,
      userId,
      data: {
        documentTitle,
        deletedByUserId,
        deletionDate: new Date().toISOString()
      }
    }))

    return this.createMany(notifications)
  }

  /**
   * Notification pour nouveau commentaire
   */
  static async notifyCommentAdded(documentId: string, documentTitle: string, commentId: string, authorId: string, sharedWithUserIds: string[]) {
    const admin = getSupabaseAdmin()
    const { data: author } = await admin
      .from('users')
      .select('name')
      .eq('id', authorId)
      .maybeSingle()

    const notifications = sharedWithUserIds.map(userId => ({
      type: 'COMMENT_ADDED' as NotificationType,
      title: 'Nouveau commentaire',
      message: `${author?.name || 'Un utilisateur'} a ajouté un commentaire sur le document "${documentTitle}".`,
      userId,
      data: {
        documentId,
        documentTitle,
        commentId,
        authorId
      }
    }))

    return this.createMany(notifications)
  }

  /**
   * Notification pour partage de dossier
   */
  static async notifyFolderShared(folderId: string, folderName: string, sharedByUserId: string, sharedWithUserId: string, permission: string) {
    const admin = getSupabaseAdmin()
    const { data: sharedByUser } = await admin
      .from('users')
      .select('name')
      .eq('id', sharedByUserId)
      .maybeSingle()

    return this.create({
      type: 'FOLDER_SHARED',
      title: 'Dossier partagé avec vous',
      message: `${sharedByUser?.name || 'Un utilisateur'} a partagé le dossier "${folderName}" avec vous (${permission.toLowerCase()}).`,
      userId: sharedWithUserId,
      data: {
        folderId,
        folderName,
        sharedByUserId,
        permission
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
  static async getDocumentSharedUsers(documentId: string, excludeUserId?: string): Promise<string[]> {
    try {
      const admin = getSupabaseAdmin()
      let query = admin
        .from('document_shares')
        .select('user_id')
        .eq('document_id', documentId)
      
      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId)
      }
      
      const { data: shares, error } = await query
      
      if (error) {
        console.error('Erreur récupération partages:', error)
        return []
      }

      return shares?.map(share => share.user_id) || []
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs partagés:', error)
      return []
    }
  }

  /**
   * Récupérer les utilisateurs qui ont accès à un dossier (pour notifications)
   */
  static async getFolderSharedUsers(folderId: string, excludeUserId?: string): Promise<string[]> {
    try {
      // Pour l'instant, retourner un tableau vide car le partage de dossiers n'est pas encore implémenté
      // TODO: Implémenter quand le système de partage de dossiers sera ajouté
      return []
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs partagés du dossier:', error)
      return []
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const admin = getSupabaseAdmin()
      const { data: notification, error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) {
        console.error('Erreur marquage notification:', error)
        return null
      }
      
      return notification
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
      return null
    }
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  static async markAllAsRead(userId: string) {
    try {
      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select('id')
      
      if (error) {
        console.error('Erreur marquage global:', error)
        return null
      }
      
      const count = data?.length || 0
      console.log(`${count} notifications marquées comme lues pour l'utilisateur ${userId}`)
      return { count }
    } catch (error) {
      console.error('Erreur lors du marquage global:', error)
      return null
    }
  }
}
