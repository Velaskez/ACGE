// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('📊 Vérification du schéma de base de données...')

    // Vérifier les tables existantes
    const tables = await prisma.$queryRaw`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `

    // Vérifier les contraintes
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name
    `

    // Vérifier les index
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    // Test de base : compter les utilisateurs
    let userCount = 0
    try {
      userCount = await prisma.user.count()
    } catch (error) {
      console.log('❌ Erreur count users:', error)
    }

    return NextResponse.json({
      message: 'Schéma de base de données analysé',
      userCount,
      tables,
      constraints,
      indexes,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Erreur vérification schéma:', error)
    return NextResponse.json({
      error: 'Erreur lors de la vérification du schéma',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
