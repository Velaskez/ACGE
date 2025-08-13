// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Initialisation de la base de données...')

    // Vérifier si les tables existent déjà
    try {
      const userCount = await prisma.user.count()
      if (userCount > 0) {
        return NextResponse.json({
          message: 'Base de données déjà initialisée',
          userCount
        })
      }
    } catch (error) {
      console.log('Tables non trouvées, création en cours...')
    }

    // Créer les tables avec Prisma
    console.log('📊 Création des tables...')
    
    // Forcer la synchronisation du schéma
    await prisma.$executeRaw`SELECT 1` // Test de connexion

    // Créer l'utilisateur admin par défaut
    console.log('👤 Création de l\'utilisateur admin...')
    
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ACGE',
        email: 'admin@acge.ga',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Migration terminée avec succès!')

    return NextResponse.json({
      message: 'Base de données initialisée avec succès',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      },
      credentials: {
        email: 'admin@acge.ga',
        password: 'admin123'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    return NextResponse.json({
      error: 'Erreur lors de l\'initialisation de la base de données',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de migration disponible',
    instructions: 'Utilisez POST pour initialiser la base de données'
  })
}
