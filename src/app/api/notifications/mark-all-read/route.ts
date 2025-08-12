import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

// PUT - Marquer toutes les notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    const userId = decoded.userId

    // Marquer toutes les notifications non lues comme lues
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      message: 'Toutes les notifications ont été marquées comme lues',
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
