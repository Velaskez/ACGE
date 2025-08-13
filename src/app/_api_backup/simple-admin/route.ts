// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔧 Création simple de l\'utilisateur admin...')

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' }
    })

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin existe déjà',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      })
    }

    // Créer l'admin
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ACGE',
        email: 'admin@acge.ga',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin créé:', admin.email)

    return NextResponse.json({
      message: 'Admin créé avec succès',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      },
      credentials: {
        email: 'admin@acge.ga',
        password: 'admin123'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur création admin:', error)
    return NextResponse.json({
      error: 'Erreur lors de la création de l\'admin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint pour créer l\'admin',
    instructions: 'Utilisez POST pour créer l\'utilisateur admin'
  })
}
