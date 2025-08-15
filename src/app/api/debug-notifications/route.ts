import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Vérifier la connexion à la base de données
    await prisma.$connect()
    
    // Test 2: Vérifier si la table notifications existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      ) as exists
    `
    
    // Test 3: Compter les notifications
    const notificationCount = await prisma.notification.count()
    
    // Test 4: Lister les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    
    return NextResponse.json({
      success: true,
      databaseConnected: true,
      notificationsTableExists: tableExists[0]?.exists || false,
      notificationCount,
      tables: tables.map((t: any) => t.table_name)
    })

  } catch (error) {
    console.error('Erreur debug notifications:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
