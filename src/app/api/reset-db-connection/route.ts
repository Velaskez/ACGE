import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Reset de connexion Prisma - Début')

    // Déconnecter proprement
    await prisma.$disconnect()
    console.log('✅ Déconnexion réussie')

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Reconnecter
    await prisma.$connect()
    console.log('✅ Reconnexion réussie')

    // Test de connexion
    const testResult = await prisma.user.count()
    console.log('✅ Test de connexion réussi:', testResult, 'utilisateurs trouvés')

    return NextResponse.json({
      success: true,
      message: 'Connexion Prisma réinitialisée avec succès',
      userCount: testResult
    })

  } catch (error) {
    console.error('❌ Erreur lors du reset de connexion:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la réinitialisation de la connexion',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}
