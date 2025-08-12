import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🚀 Force disable RLS avec approche directe...')

    // Utiliser fetch pour appeler l'API de manière externe
    // Cela évite le cache Prisma internal
    const baseURL = process.env.NEXTAUTH_URL || 'https://acge-zeta.vercel.app'
    
    console.log('1️⃣ Test de santé de base...')
    const healthResponse = await fetch(`${baseURL}/api/debug-env`)
    const healthData = await healthResponse.json()
    console.log('Debug env:', healthData)

    // Maintenant utilisons une requête SQL directe avec un client fresh
    const { Pool } = require('pg')
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    console.log('2️⃣ Connexion directe PostgreSQL...')
    const client = await pool.connect()

    try {
      // Lister les tables avec RLS
      const rlsCheck = await client.query(`
        SELECT schemaname, tablename, rowsecurity 
        FROM pg_tables t
        LEFT JOIN pg_class c ON c.relname = t.tablename 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `)
      
      console.log('Tables RLS status:', rlsCheck.rows)

      // Désactiver RLS sur toutes les tables trouvées
      const results = []
      for (const row of rlsCheck.rows) {
        if (row.rowsecurity === true) {
          try {
            await client.query(`ALTER TABLE "${row.tablename}" DISABLE ROW LEVEL SECURITY`)
            results.push(`✅ ${row.tablename}: RLS désactivé`)
            console.log(`✅ RLS désactivé pour ${row.tablename}`)
          } catch (error: any) {
            results.push(`⚠️ ${row.tablename}: ${error.message}`)
            console.log(`⚠️ ${row.tablename}:`, error.message)
          }
        } else {
          results.push(`ℹ️ ${row.tablename}: RLS déjà désactivé`)
        }
      }

      // Donner privilège BYPASSRLS
      try {
        await client.query(`ALTER ROLE authenticator WITH BYPASSRLS`)
        results.push('✅ BYPASSRLS accordé à authenticator')
      } catch (error: any) {
        results.push(`⚠️ BYPASSRLS: ${error.message}`)
      }

      // Test final
      const finalCheck = await client.query('SELECT COUNT(*) as count FROM "User"')
      results.push(`✅ Test final: ${finalCheck.rows[0].count} utilisateurs`)

      client.release()
      await pool.end()

      return NextResponse.json({
        message: 'Force disable RLS terminé',
        results,
        timestamp: new Date().toISOString(),
        success: true
      })

    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Erreur force disable:', error)
    return NextResponse.json({
      error: 'Erreur force disable RLS',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Simple test avec pg direct
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()
    const result = await client.query('SELECT NOW() as time, COUNT(*) as user_count FROM "User"')
    client.release()
    await pool.end()

    return NextResponse.json({
      message: 'Test PG direct',
      result: result.rows[0],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur test PG',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
