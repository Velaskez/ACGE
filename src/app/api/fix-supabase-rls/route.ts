import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    console.log('🔧 Correction complète des problèmes Supabase RLS...')

    const results = []

    // 1. Désactiver RLS sur toutes nos tables (selon la doc Supabase)
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

    console.log('📋 Étape 1: Désactivation RLS sur toutes les tables...')
    for (const table of tables) {
      try {
        await prisma.$executeRaw`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY`
        results.push(`✅ ${table}: RLS désactivé`)
        console.log(`✅ RLS désactivé pour ${table}`)
      } catch (error) {
        results.push(`⚠️ ${table}: ${error}`)
        console.log(`⚠️ ${table}:`, error)
      }
    }

    // 2. Accorder les privilèges bypassrls au rôle postgres (selon la doc)
    console.log('📋 Étape 2: Configuration des privilèges bypassrls...')
    try {
      // Donner le privilège bypassrls au rôle authenticator (utilisé par les connexions pooler)
      await prisma.$executeRaw`ALTER ROLE authenticator WITH BYPASSRLS`
      results.push('✅ Privilège BYPASSRLS accordé au rôle authenticator')
    } catch (error) {
      results.push(`⚠️ BYPASSRLS authenticator: ${error}`)
    }

    try {
      // Aussi pour le rôle postgres si possible
      await prisma.$executeRaw`ALTER ROLE postgres WITH BYPASSRLS`
      results.push('✅ Privilège BYPASSRLS accordé au rôle postgres')
    } catch (error) {
      results.push(`⚠️ BYPASSRLS postgres: ${error}`)
    }

    // 3. Supprimer toutes les politiques RLS existantes (selon la doc)
    console.log('📋 Étape 3: Suppression des politiques RLS...')
    for (const table of tables) {
      try {
        // Récupérer les politiques existantes pour cette table
        const policies = await prisma.$queryRaw`
          SELECT policyname 
          FROM pg_policies 
          WHERE schemaname = 'public' AND tablename = ${table}
        ` as any[]

        for (const policy of policies) {
          try {
            await prisma.$executeRaw`DROP POLICY IF EXISTS ${policy.policyname} ON ${table}`
            results.push(`✅ Politique "${policy.policyname}" supprimée de ${table}`)
          } catch (e) {
            results.push(`⚠️ Erreur suppression politique ${policy.policyname}: ${e}`)
          }
        }
      } catch (error) {
        results.push(`⚠️ Erreur liste politiques ${table}: ${error}`)
      }
    }

    // 4. Vérifier l'état final
    console.log('📋 Étape 4: Vérification de l\'état final...')
    const finalState = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity as rls_enabled,
        hasrls as has_rls_policies
      FROM pg_tables t
      LEFT JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    return NextResponse.json({
      message: 'Correction Supabase RLS terminée',
      results,
      finalState,
      timestamp: new Date().toISOString(),
      success: true
    })

  } catch (error) {
    console.error('❌ Erreur correction Supabase:', error)
    return NextResponse.json({
      error: 'Erreur lors de la correction Supabase',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier l'état actuel RLS
    const rlsState = await prisma.$queryRaw`
      SELECT 
        schemaname, 
        tablename, 
        rowsecurity as rls_enabled
      FROM pg_tables t
      LEFT JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    // Lister les politiques existantes
    const policies = await prisma.$queryRaw`
      SELECT schemaname, tablename, policyname, cmd, roles
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `

    return NextResponse.json({
      message: 'État actuel Row Level Security',
      rlsState,
      policies,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification RLS',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
