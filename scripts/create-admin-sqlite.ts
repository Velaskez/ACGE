import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function createAdminSQLite() {
  try {
    console.log('👤 Création d\'un utilisateur admin pour SQLite...')
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge-gabon.com' }
    })
    
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà')
      console.log('📧 Email :', existingAdmin.email)
      console.log('👤 Nom :', existingAdmin.name)
      console.log('🔑 Mot de passe : admin')
      return
    }
    
    // Créer le hash du mot de passe
    const password = 'admin'
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        name: 'Admin ACGE',
        email: 'admin@acge-gabon.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Utilisateur admin créé avec succès !')
    console.log('📧 Email :', admin.email)
    console.log('👤 Nom :', admin.name)
    console.log('🔑 Mot de passe :', password)
    console.log('🔐 Hash :', admin.password)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin :', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createAdminSQLite()
