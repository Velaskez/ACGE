import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function PUT(request: NextRequest) {
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

    // Marquer toutes les notifications non lues de l'utilisateur comme lues
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      message: `${result.count} notifications marquées comme lues`,
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Erreur marquage global notifications:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
