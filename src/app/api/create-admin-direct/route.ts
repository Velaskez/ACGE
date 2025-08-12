import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('👤 Création admin directe avec PostgreSQL...')

    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()

    try {
      // Supprimer l'admin existant s'il existe
      await client.query(`DELETE FROM users WHERE email = 'admin@acge.ga'`)
      console.log('🗑️ Ancien admin supprimé')

      // Créer le hash du mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      // Insérer le nouvel admin directement
      const result = await client.query(`
        INSERT INTO users (id, name, email, password, role, "emailVerified", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          'Administrateur ACGE',
          'admin@acge.ga',
          $1,
          'ADMIN',
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING id, email, name, role, "createdAt"
      `, [hashedPassword])

      const admin = result.rows[0]
      console.log('✅ Admin créé:', admin)

      // Vérifier le total d'utilisateurs
      const countResult = await client.query('SELECT COUNT(*) as count FROM users')
      const totalUsers = parseInt(countResult.rows[0].count)

      client.release()
      await pool.end()

      return NextResponse.json({
        message: 'Admin créé directement avec PostgreSQL',
        admin,
        totalUsers,
        credentials: {
          email: 'admin@acge.ga',
          password: 'admin123'
        },
        timestamp: new Date().toISOString()
      }, { status: 201 })

    } catch (error) {
      client.release()
      await pool.end()
      throw error
    }

  } catch (error) {
    console.error('❌ Erreur création admin directe:', error)
    return NextResponse.json({
      error: 'Erreur création admin directe',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier l'admin avec PostgreSQL direct
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()
    
    const adminResult = await client.query(`
      SELECT id, email, name, role, "createdAt"
      FROM users 
      WHERE email = 'admin@acge.ga'
    `)
    
    const countResult = await client.query('SELECT COUNT(*) as count FROM users')
    
    client.release()
    await pool.end()

    const admin = adminResult.rows[0] || null
    const totalUsers = parseInt(countResult.rows[0].count)

    return NextResponse.json({
      message: 'État admin (PostgreSQL direct)',
      admin,
      totalUsers,
      exists: !!admin
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur vérification admin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
