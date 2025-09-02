import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Prisma - Début')
    
    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion Prisma réussie')

    // Test des modèles existants
    const usersCount = await prisma.user.count()
    console.log(`👥 Utilisateurs: ${usersCount}`)

    // Test des nouvelles tables comptables
    try {
      const naturesCount = await prisma.natureDocument.count()
      console.log(`📄 Natures de documents: ${naturesCount}`)
    } catch (error) {
      console.error('❌ Erreur NatureDocument:', error)
      return NextResponse.json({
        success: false,
        error: 'Table NatureDocument non trouvée',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 })
    }

    try {
      const postesCount = await prisma.posteComptable.count()
      console.log(`📊 Postes comptables: ${postesCount}`)
    } catch (error) {
      console.error('❌ Erreur PosteComptable:', error)
      return NextResponse.json({
        success: false,
        error: 'Table PosteComptable non trouvée',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test Prisma réussi',
      counts: {
        users: usersCount,
        naturesDocuments: await prisma.natureDocument.count(),
        postesComptables: await prisma.posteComptable.count()
      }
    })

  } catch (error) {
    console.error('❌ Erreur générale Prisma:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur générale Prisma',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
