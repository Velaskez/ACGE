import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  
  try {
    console.log('🔐 Mise à jour des mots de passe via API...')

    // Mettre à jour le mot de passe pour admin@acge.ga
    const hashedPassword1 = await bcrypt.hash('admin123', 10)
    const user1 = await prisma.user.update({
      where: { email: 'admin@acge.ga' },
      data: { password: hashedPassword1 }
    })
    console.log('✅ Mot de passe mis à jour pour:', user1.email)

    // Mettre à jour le mot de passe pour admin@acge-gabon.com
    const hashedPassword2 = await bcrypt.hash('Admin2025!', 10)
    const user2 = await prisma.user.update({
      where: { email: 'admin@acge-gabon.com' },
      data: { password: hashedPassword2 }
    })
    console.log('✅ Mot de passe mis à jour pour:', user2.email)

    // Créer un nouvel utilisateur avec le mot de passe que vous connaissez
    const hashedPassword3 = await bcrypt.hash('Admin2025!', 10)
    const user3 = await prisma.user.upsert({
      where: { email: 'admin@acge.com' },
      update: { password: hashedPassword3 },
      create: {
        email: 'admin@acge.com',
        name: 'Administrateur Principal ACGE',
        password: hashedPassword3,
        role: 'ADMIN'
      }
    })
    console.log('✅ Utilisateur créé/mis à jour:', user3.email)

    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mots de passe mis à jour avec succès',
      users: allUsers,
      passwords: {
        'admin@acge.ga': 'admin123',
        'admin@acge-gabon.com': 'Admin2025!',
        'admin@acge.com': 'Admin2025!'
      }
    })

  } catch (error: any) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
