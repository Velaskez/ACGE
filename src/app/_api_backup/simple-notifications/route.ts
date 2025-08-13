// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Simple Notifications API...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        error: 'Non authentifié'
      }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    console.log('✅ User ID:', userId)

    // Test simple: compter les notifications
    console.log('🔍 Test: Compter les notifications...')
    const notificationsCount = await prisma.notification.count({
      where: { userId }
    })
    console.log('✅ Notifications count:', notificationsCount)

    // Récupérer quelques notifications
    console.log('🔍 Test: Récupérer notifications...')
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    console.log('✅ Notifications trouvées:', notifications.length)

    return NextResponse.json({
      notifications,
      total: notificationsCount,
      unread: notifications.filter(n => !n.isRead).length
    })

  } catch (error) {
    console.error('❌ Erreur simple notifications:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
