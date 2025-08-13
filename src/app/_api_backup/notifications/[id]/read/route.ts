// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// PUT - Marquer une notification comme lue/non lue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    const body = await request.json()
    const { isRead } = body

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'isRead doit être un boolean' },
        { status: 400 }
      )
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findFirst({
      where: {
        id: resolvedParams.id,
        userId
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      )
    }

    // Mettre à jour le statut
    const updatedNotification = await prisma.notification.update({
      where: { id: resolvedParams.id },
      data: { isRead }
    })

    return NextResponse.json({
      message: `Notification marquée comme ${isRead ? 'lue' : 'non lue'}`,
      notification: updatedNotification
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de notification:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }


// Fonction requise pour l'export statique

// Fonction requise pour l'export statique
export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]
}
    { id: '2' },
    { id: '3' },
  ]
}
}
