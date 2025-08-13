// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔒 Désactivation Row Level Security...')

    // Désactiver RLS sur toutes les tables
    const tables = [
      'users',
      'documents', 
      'document_versions',
      'folders',
      'notifications',
      'document_shares',
      'comments',
      'tags'
    ]

    const results = []

    for (const table of tables) {
      try {
        await prisma.$executeRaw`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`
        results.push(`✅ ${table}: RLS désactivé`)
        console.log(`✅ RLS désactivé pour ${table}`)
      } catch (error) {
        results.push(`❌ ${table}: ${error}`)
        console.log(`❌ Erreur ${table}:`, error)
      }
    }

    return NextResponse.json({
      message: 'Tentative de désactivation RLS terminée',
      results,
      success: true
    })

  } catch (error) {
    console.error('❌ Erreur générale RLS:', error)
    return NextResponse.json({
      error: 'Erreur lors de la désactivation RLS',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier l'état RLS
    const result = await prisma.$queryRaw`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    return NextResponse.json({
      message: 'État Row Level Security',
      tables: result
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification RLS',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
