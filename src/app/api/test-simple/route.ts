import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Test simple - Début')
    
    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion établie')
    
    // Test de requête simple
    const count = await prisma.user.count()
    console.log('✅ Nombre d\'utilisateurs:', count)
    
    await prisma.$disconnect()
    console.log('✅ Déconnexion réussie')
    
    return NextResponse.json({
      success: true,
      message: 'Test simple réussi',
      userCount: count,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Erreur test simple:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
