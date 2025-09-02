import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test de connexion à la base de données...')

    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')

    // Test des tables comptables
    const naturesCount = await prisma.natureDocument.count()
    const postesCount = await prisma.posteComptable.count()
    
    console.log(`📊 Natures de documents: ${naturesCount}`)
    console.log(`📊 Postes comptables: ${postesCount}`)

    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données réussie',
      tables: {
        naturesDocuments: naturesCount,
        postesComptables: postesCount
      }
    })

  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur de connexion à la base de données',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
