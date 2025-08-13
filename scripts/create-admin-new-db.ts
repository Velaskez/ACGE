import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👤 Création de l\'utilisateur admin...')
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' }
    })
    
    if (existingAdmin) {
      console.log('✅ Utilisateur admin existe déjà:', existingAdmin.email)
      return
    }
    
    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@acge.ga',
        password: hashedPassword,
        name: 'Administrateur ACGE',
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Utilisateur admin créé avec succès:', admin.email)
    
    // Créer un dossier racine
    const rootFolder = await prisma.folder.create({
      data: {
        name: 'Racine',
        description: 'Dossier racine du système',
        authorId: admin.id
      }
    })
    
    console.log('✅ Dossier racine créé:', rootFolder.name)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
