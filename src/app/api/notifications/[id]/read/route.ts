import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notificationId = params.id
    const body = await request.json()
    const { isRead } = body

    // Validation
    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Le paramètre isRead est requis et doit être un booléen' },
        { status: 400 }
      )
    }

    // Vérifier que la notification existe et appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    // Vérifier les permissions (admin ou propriétaire de la notification)
    if (userRole !== 'ADMIN' && notification.userId !== userId) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Mettre à jour la notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
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

    return NextResponse.json(updatedNotification)

  } catch (error) {
    console.error('Erreur mise à jour notification:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
