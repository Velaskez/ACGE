import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminPrisma() {
  try {
    console.log('🔐 Création d\'un utilisateur admin avec Prisma...')
    
    // Vérifier la connexion
    console.log('📡 Test de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge-gabon.com' }
    })
    
    if (existingAdmin) {
      console.log('👤 Utilisateur admin existe déjà')
      console.log('📧 Email :', existingAdmin.email)
      console.log('👤 Nom :', existingAdmin.name)
      console.log('🔄 Mise à jour du mot de passe...')
      
      // Mettre à jour le mot de passe
      const password = 'admin123'
      const hashedPassword = await bcrypt.hash(password, 12)
      
      await prisma.user.update({
        where: { email: 'admin@acge-gabon.com' },
        data: { password: hashedPassword }
      })
      
      console.log('✅ Mot de passe mis à jour avec succès !')
      console.log('🔑 Mot de passe :', password)
      
    } else {
      // Créer un nouvel utilisateur admin
      console.log('👤 Création d\'un nouvel utilisateur admin...')
      
      const password = 'admin123'
      const hashedPassword = await bcrypt.hash(password, 12)
      
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
    }
    
    // Vérifier le nombre d'utilisateurs
    const userCount = await prisma.user.count()
    console.log(`\n📊 Nombre total d'utilisateurs : ${userCount}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin :', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
createAdminPrisma()
