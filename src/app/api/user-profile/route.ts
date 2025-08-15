import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  
  try {
    console.log('🔍 User profile - Début')
    
    // Pour l'instant, retourner un utilisateur de test
    // En production, vous vérifieriez le token d'authentification
    
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    if (testUser) {
      return NextResponse.json({
        success: true,
        user: testUser,
        message: 'Profil utilisateur récupéré',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Aucun utilisateur trouvé',
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
  } catch (error: any) {
    console.error('❌ Erreur user profile:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
