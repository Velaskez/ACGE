import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👤 Création de l\'administrateur dans la base MySQL LWS...')
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge.local' }
    })
    
    if (existingAdmin) {
      console.log('⚠️ L\'administrateur existe déjà !')
      console.log('📧 Email:', existingAdmin.email)
      console.log('🔑 Mot de passe: admin123')
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ACGE',
        email: 'admin@acge.local',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Administrateur créé avec succès !')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Mot de passe: admin123')
    console.log('🆔 ID:', admin.id)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur :', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
