import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Vérification structure table users...')

    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()

    try {
      // Vérifier la structure de la table users
      const columnsQuery = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position
      `)

      console.log('Colonnes table users:', columnsQuery.rows)

      // Compter les utilisateurs existants
      const countQuery = await client.query('SELECT COUNT(*) as count FROM users')
      const userCount = parseInt(countQuery.rows[0].count)

      // Lister les utilisateurs existants (sans mot de passe)
      const usersQuery = await client.query(`
        SELECT id, name, email, role, "createdAt", "updatedAt"
        FROM users 
        LIMIT 5
      `)

      client.release()
      await pool.end()

      return NextResponse.json({
        message: 'Structure table users',
        columns: columnsQuery.rows,
        userCount,
        existingUsers: usersQuery.rows,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Erreur check users table:', error)
    return NextResponse.json({
      error: 'Erreur vérification table users',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
