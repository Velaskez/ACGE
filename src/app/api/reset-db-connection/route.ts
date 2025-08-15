import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Réinitialisation de la connexion Prisma...')
    
    // Fermer la connexion Prisma
    await prisma.$disconnect()
    
    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Tester la reconnexion avec une requête simple
    try {
      await prisma.$connect()
      const testQuery = await prisma.user.count()
      console.log('✅ Connexion Prisma réinitialisée avec succès')
      
      return NextResponse.json({
        success: true,
        message: 'Connexion Prisma réinitialisée avec succès',
        testQuery: testQuery
      })
    } catch (reconnectError) {
      console.error('❌ Erreur lors de la reconnexion:', reconnectError)
      return NextResponse.json({
        success: false,
        error: 'Erreur lors de la reconnexion Prisma'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Erreur réinitialisation connexion:', error)
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la réinitialisation'
    }, { status: 500 })
  }
}
