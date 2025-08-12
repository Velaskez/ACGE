import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔄 Redémarrage des connexions DB...')

    // 1. Forcer la déconnexion de Prisma
    await prisma.$disconnect()
    console.log('✅ Prisma déconnecté')

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. Reconnecter et tester
    await prisma.$connect()
    console.log('✅ Prisma reconnecté')

    // 3. Test simple
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Test query OK:', testQuery)

    // 4. Test comptage
    const userCount = await prisma.user.count()
    console.log('✅ User count:', userCount)

    return NextResponse.json({
      message: 'Connexions DB redémarrées avec succès',
      userCount,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur restart DB:', error)
    return NextResponse.json({
      error: 'Erreur restart DB',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Test simple de connexion
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`
    return NextResponse.json({
      message: 'Test connexion DB',
      result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Erreur test DB',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
