// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔧 Correction simple Supabase RLS...')

    const results = []

    // Liste des tables de notre schéma
    const tables = [
      'User',        // Prisma utilise les noms de modèles
      'Document', 
      'DocumentVersion',
      'Folder',
      'Notification',
      'DocumentShare',
      'Comment',
      'Tag'
    ]

    // 1. Désactiver RLS sur toutes les tables
    console.log('📋 Désactivation RLS...')
    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY;`)
        results.push(`✅ ${table}: RLS désactivé`)
        console.log(`✅ RLS désactivé pour ${table}`)
      } catch (error: any) {
        results.push(`⚠️ ${table}: ${error.message}`)
        console.log(`⚠️ ${table}:`, error.message)
      }
    }

    // 2. Donner privilège BYPASSRLS 
    console.log('📋 Configuration BYPASSRLS...')
    try {
      await prisma.$executeRawUnsafe(`ALTER ROLE authenticator WITH BYPASSRLS;`)
      results.push('✅ BYPASSRLS accordé à authenticator')
    } catch (error: any) {
      results.push(`⚠️ BYPASSRLS authenticator: ${error.message}`)
    }

    // 3. Test de base des données
    console.log('📋 Test données...')
    try {
      const userCount = await prisma.user.count()
      const docCount = await prisma.document.count()
      results.push(`✅ Test données: ${userCount} users, ${docCount} documents`)
    } catch (error: any) {
      results.push(`⚠️ Test données: ${error.message}`)
    }

    return NextResponse.json({
      message: 'Correction simple Supabase terminée',
      results,
      timestamp: new Date().toISOString(),
      success: true
    })

  } catch (error) {
    console.error('❌ Erreur correction simple:', error)
    return NextResponse.json({
      error: 'Erreur lors de la correction simple',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Test simple de la base
    const userCount = await prisma.user.count()
    const docCount = await prisma.document.count()
    const notifCount = await prisma.notification.count()

    return NextResponse.json({
      message: 'État base de données',
      counts: {
        users: userCount,
        documents: docCount, 
        notifications: notifCount
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur test base',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
