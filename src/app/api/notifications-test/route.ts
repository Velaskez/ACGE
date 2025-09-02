import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Mode test - Notifications simulées...')
    
    // Simuler des notifications de test
    const notifications = [
      {
        id: 'notif-1',
        title: 'Document uploadé',
        message: 'Le document test.txt a été uploadé avec succès',
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif-2',
        title: 'Dossier créé',
        message: 'Un nouveau dossier a été créé',
        type: 'info',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]

    return NextResponse.json({
      notifications,
      unreadCount: 1,
      pagination: {
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1
      }
    })

  } catch (error) {
    console.error('💥 Erreur notifications test:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
