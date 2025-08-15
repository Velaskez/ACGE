import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Vérifier si la table existe déjà
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      ) as exists
    `
    
    if (tableExists[0]?.exists) {
      return NextResponse.json({
        success: true,
        message: 'Table notifications existe déjà',
        tableExists: true
      })
    }
    
    // Créer la table notifications
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "data" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        
        CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
      )
    `
    
    // Créer l'index sur userId
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId")
    `
    
    // Créer l'index sur createdAt
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt")
    `
    
    // Créer la contrainte de clé étrangère
    await prisma.$executeRaw`
      ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `
    
    return NextResponse.json({
      success: true,
      message: 'Table notifications créée avec succès',
      tableExists: false,
      created: true
    })

  } catch (error) {
    console.error('Erreur création table notifications:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
