import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {

  try {
    console.log('🔍 Test DB - Début')
    console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL)
    
    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion établie')
    
    // Test de requête simple
    const count = await prisma.user.count()
    console.log('✅ Nombre d\'utilisateurs:', count)

    console.log('✅ Déconnexion réussie')
    
    return NextResponse.json({
      success: true,
      message: 'Test DB réussi',
      userCount: count,
      databaseUrl: process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Erreur test DB:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
