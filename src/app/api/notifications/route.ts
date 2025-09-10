import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { 
  getUserNotifications, 
  createNotification, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getUnreadCount 
} from '@/lib/notifications-memory'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const action = searchParams.get('action')

    // Actions spéciales
    if (action === 'unread-count') {
      const count = await getUnreadCount(userId)
      return NextResponse.json({ count })
    }

    if (action === 'mark-all-read') {
      const count = await markAllNotificationsAsRead(userId)
      return NextResponse.json({ success: true, markedCount: count })
    }

    // Récupérer les notifications
    const allNotifications = await getUserNotifications(userId, limit * 2) // Récupérer plus pour filtrer
    
    // Filtrer les notifications non lues si demandé
    const notifications = unreadOnly 
      ? allNotifications.filter(n => !n.isRead)
      : allNotifications

    // Pagination
    const skip = (page - 1) * limit
    const paginatedNotifications = notifications.slice(skip, skip + limit)

    const unreadCount = await getUnreadCount(userId)

    return NextResponse.json({
      notifications: paginatedNotifications,
      unreadCount,
      pagination: {
        total: notifications.length,
        page,
        limit,
        totalPages: Math.ceil(notifications.length / limit)
      }
    })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role

    // Seuls les admins peuvent créer des notifications
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, message, type, userId: targetUserId, data } = body

    // Validation
    if (!title || !message || !type || !targetUserId) {
      return NextResponse.json(
        { error: 'Titre, message, type et userId sont requis' },
        { status: 400 }
      )
    }

    const result = await createNotification({
      title,
      message,
      type: type || 'info',
      userId: targetUserId,
      data: data || {}
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Erreur création notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      notification: { id: result.id }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    const body = await request.json()
    const { notificationId, action } = body

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'notificationId et action sont requis' },
        { status: 400 }
      )
    }

    let success = false

    if (action === 'mark-read') {
      success = await markNotificationAsRead(notificationId, userId)
    } else if (action === 'delete') {
      success = await deleteNotification(notificationId, userId)
    } else {
      return NextResponse.json(
        { error: 'Action non supportée' },
        { status: 400 }
      )
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Action échouée' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erreur API notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}