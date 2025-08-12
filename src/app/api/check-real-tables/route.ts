import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Vérification des vraies tables PostgreSQL...')

    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()

    try {
      // Lister toutes les tables dans public
      const tablesQuery = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)

      console.log('Tables trouvées:', tablesQuery.rows)

      // Vérifier RLS sur les tables existantes
      const rlsQuery = await client.query(`
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `)

      console.log('RLS status:', rlsQuery.rows)

      client.release()
      await pool.end()

      return NextResponse.json({
        message: 'Schéma réel PostgreSQL',
        tables: tablesQuery.rows,
        rlsStatus: rlsQuery.rows,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Erreur check tables:', error)
    return NextResponse.json({
      error: 'Erreur vérification tables',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
