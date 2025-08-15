import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId
    const userRole = decoded.role

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Construire les conditions de filtrage
    const where: any = {
      userId: userId
    }

    if (unreadOnly) {
      where.isRead = false
    }

    // Récupérer les notifications
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.notification.count({ where })
    ])

    // Calculer le nombre de notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Erreur récupération notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value

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

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur cible non trouvé' },
        { status: 404 }
      )
    }

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: targetUserId,
        data: data || {},
        isRead: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(notification, { status: 201 })

  } catch (error) {
    console.error('Erreur création notification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
