// Réexporter les fonctions du système robuste
export { 
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  notifyAdmins,
  DocumentNotifications,
  FolderNotifications,
  type NotificationData
} from './notifications-memory'