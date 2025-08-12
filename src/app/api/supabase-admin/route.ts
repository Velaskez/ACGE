import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('👤 Création admin pour Supabase...')

    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()

    try {
      // D'abord vérifier la structure de la table users
      const columnsQuery = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
      `)
      
      const columns = columnsQuery.rows.map(row => row.column_name)
      console.log('Colonnes disponibles:', columns)

      // Supprimer l'admin existant s'il existe
      await client.query(`DELETE FROM users WHERE email = 'admin@acge.ga'`)
      console.log('🗑️ Ancien admin supprimé')

      // Créer le hash du mot de passe
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      // Construire l'insertion en fonction des colonnes disponibles
      let insertQuery = ''
      let values = []
      
      if (columns.includes('emailVerified')) {
        // Si emailVerified existe (schéma NextAuth standard)
        insertQuery = `
          INSERT INTO users (name, email, password, role, "emailVerified", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
          RETURNING id, email, name, role, "createdAt"
        `
        values = ['Administrateur ACGE', 'admin@acge.ga', hashedPassword, 'ADMIN']
      } else {
        // Schéma simplifié
        insertQuery = `
          INSERT INTO users (name, email, password, role, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          RETURNING id, email, name, role, "createdAt"
        `
        values = ['Administrateur ACGE', 'admin@acge.ga', hashedPassword, 'ADMIN']
      }

      const result = await client.query(insertQuery, values)
      const admin = result.rows[0]
      console.log('✅ Admin créé:', admin)

      // Compter les utilisateurs
      const countResult = await client.query('SELECT COUNT(*) as count FROM users')
      const totalUsers = parseInt(countResult.rows[0].count)

      client.release()
      await pool.end()

      return NextResponse.json({
        message: 'Admin créé pour Supabase',
        admin,
        totalUsers,
        columns: columns, // Pour debug
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
    console.error('❌ Erreur création admin Supabase:', error)
    return NextResponse.json({
      error: 'Erreur création admin Supabase',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier la table users et admin existant
    const { Pool } = require('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })

    const client = await pool.connect()
    
    // Structure de la table
    const columnsQuery = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `)
    
    // Utilisateurs existants
    const usersQuery = await client.query(`
      SELECT id, name, email, role, "createdAt"
      FROM users 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `)
    
    const countQuery = await client.query('SELECT COUNT(*) as count FROM users')
    
    client.release()
    await pool.end()

    return NextResponse.json({
      message: 'État table users Supabase',
      columns: columnsQuery.rows,
      users: usersQuery.rows,
      totalUsers: parseInt(countQuery.rows[0].count),
      adminExists: usersQuery.rows.some(user => user.email === 'admin@acge.ga')
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur vérification Supabase',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
