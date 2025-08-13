import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Vérification de la connexion à la base de données...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
    
    // Vérifier si la table User existe
    const userCount = await prisma.user.count()
    console.log(`📊 Nombre d'utilisateurs dans la base : ${userCount}`)
    
    // Vérifier si l'admin existe
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' }
    })
    
    if (!admin) {
      console.log('⚠️  Utilisateur admin non trouvé, création en cours...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@acge.ga',
          password: hashedPassword,
          name: 'Administrateur ACGE',
          role: 'ADMIN'
        }
      })
      
      console.log('✅ Utilisateur admin créé avec succès:', newAdmin.email)
    } else {
      console.log('✅ Utilisateur admin existe déjà:', admin.email)
    }
    
    // Vérifier les autres tables
    const documentCount = await prisma.document.count()
    const folderCount = await prisma.folder.count()
    
    console.log(`📄 Documents : ${documentCount}`)
    console.log(`📁 Dossiers : ${folderCount}`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
