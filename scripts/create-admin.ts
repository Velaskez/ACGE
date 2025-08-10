import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ Un administrateur existe déjà dans la base de données.')
      console.log(`Email: ${existingAdmin.email}`)
      return
    }

    // Données de l'administrateur par défaut
    const adminData = {
      name: 'Administrateur',
      email: 'admin@ged.local',
      password: 'admin123', // À changer en production !
      role: 'ADMIN' as const
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 12)

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        role: adminData.role
      }
    })

    console.log('✅ Administrateur créé avec succès !')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Mot de passe:', adminData.password)
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion !')

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createAdmin()
