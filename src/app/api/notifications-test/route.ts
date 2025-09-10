import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test de création de notifications')
    
    // Simuler des notifications de test
    const testNotifications = [
      {
        id: 'test-1',
        type: 'WELCOME',
        title: 'Bienvenue !',
        message: 'Bienvenue dans ACGE ! Votre compte a été créé avec succès.',
        isRead: false,
        createdAt: new Date(),
        userId: 'test-user-1',
        data: { source: 'test' }
      },
      {
        id: 'test-2',
        type: 'DOCUMENT_SHARED',
        title: 'Document partagé',
        message: 'Un nouveau document a été partagé avec vous.',
        isRead: false,
        createdAt: new Date(),
        userId: 'test-user-1',
        data: { documentId: 'doc-123', source: 'test' }
      }
    ]

    return NextResponse.json({
      success: true,
      message: `${testNotifications.length} notifications de test simulées`,
      notifications: testNotifications
    })

  } catch (error) {
    console.error('Erreur création notifications de test:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création des notifications de test' },
      { status: 500 }
    )
  }
}