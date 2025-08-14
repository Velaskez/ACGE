import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// GET - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Construire la requête
    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    // Récupérer les notifications (séquence pour éviter prepared statements race)
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit
    })
    const totalCount = await prisma.notification.count({ where })
    const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } })

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      unreadCount
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}

// POST - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const currentUserId = decoded.userId

    // Vérifier les permissions (seuls ADMIN et MANAGER peuvent créer des notifications pour d'autres)
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { role: true }
    })

    if (!currentUser || !['ADMIN', 'MANAGER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    const body = await request.json()
    const { type, title, message, userId, data } = body

    // Validation
    if (!type || !title || !message || !userId) {
      return NextResponse.json(
        { error: 'Type, titre, message et userId sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur cible non trouvé' }, { status: 404 })
    }

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        data: data || null
      }
    })

    return NextResponse.json({
      message: 'Notification créée avec succès',
      notification
    })

  } catch (error) {
    console.error('Erreur lors de la création de notification:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
