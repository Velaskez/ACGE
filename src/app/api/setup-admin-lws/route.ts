import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('👑 Création d\'un administrateur LWS...')
    
    // Informations du nouvel admin
    const adminEmail = 'admin@acge-gabon.com'
    const adminPassword = 'Admin2025!'
    const adminName = 'Administrateur ACGE'
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      console.log(`⚠️ L'utilisateur ${adminEmail} existe déjà`)
      console.log('   Mise à jour du mot de passe...')
      
      // Mettre à jour le mot de passe
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: adminName
        }
      })
      
      console.log('✅ Mot de passe mis à jour')
    } else {
      // Créer un nouvel utilisateur
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN'
        }
      })
      
      console.log('✅ Nouvel administrateur créé')
    }
    
    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Administrateur configuré avec succès',
      user: {
        email: adminEmail,
        password: adminPassword, // Mot de passe en clair pour l'affichage
        name: adminName,
        role: 'ADMIN'
      },
      userInfo: user
    })
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erreur lors de la création de l\'administrateur'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log('🔍 Vérification des utilisateurs existants...')
    
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      users: users,
      count: users.length
    })
    
  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Erreur lors de la vérification des utilisateurs'
    }, { status: 500 })
  }
}
