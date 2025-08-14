import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('👤 Création admin propre (post-RLS fix)...')

    // Supprimer l'admin existant s'il existe
    await prisma.user.deleteMany({
      where: { email: 'admin@acge.ga' }
    })
    console.log('🗑️ Ancien admin supprimé')

    // Créer l'admin avec un hash de mot de passe propre
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

    // Vérifier que l'admin peut être trouvé
    const verifyAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })

    // Compter les utilisateurs totaux
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      message: 'Admin créé avec succès (post-RLS fix)',
      admin: verifyAdmin,
      totalUsers,
      credentials: {
        email: 'admin@acge.ga',
        password: 'admin123'
      },
      timestamp: new Date().toISOString()
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Erreur création admin clean:', error)
    return NextResponse.json({
      error: 'Erreur lors de la création admin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Vérifier l'état de l'admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })

    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      message: 'État de l\'admin',
      admin,
      totalUsers,
      exists: !!admin
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Erreur lors de la vérification admin',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
