import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug API Notifications...')
    
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({
        error: 'Non authentifié',
        step: 'auth_check'
      }, { status: 401 })
    }

    const decoded = verify(token, process.env.NEXTAUTH_SECRET || 'unified-jwt-secret-for-development') as any
    const userId = decoded.userId

    // Test 1: Vérifier que la table Notification existe
    try {
      const notificationsCount = await prisma.notification.count({
        where: { userId }
      })
      console.log('✅ Notifications count:', notificationsCount)

      // Test 2: Essayer de récupérer des notifications
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
      console.log('✅ Notifications récupérées:', notifications.length)

      return NextResponse.json({
        success: true,
        data: {
          userId,
          notificationsCount,
          sampleNotifications: notifications,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.log('❌ Erreur notifications:', error)
      
      // Peut-être que la table n'existe pas encore
      return NextResponse.json({
        error: 'Table Notification non trouvée ou erreur de structure',
        step: 'notifications_check',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
        suggestion: 'La table Notification n\'a peut-être pas été créée'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Erreur générale debug notifications:', error)
    return NextResponse.json({
      error: 'Erreur interne du serveur',
      step: 'general_error',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
