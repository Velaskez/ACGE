import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

// Créer un fichier .env.local s'il n'existe pas
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  const envContent = `# Base de données SQLite pour le développement
DATABASE_URL="file:./prisma/dev.db"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-${Math.random().toString(36).substring(7)}"

# Environment
NODE_ENV="development"`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env.local créé avec SQLite pour le développement')
}

// Utiliser SQLite pour le développement
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

async function setupDevDatabase() {
  try {
    console.log('🔧 Configuration de la base de données de développement...')

    // Créer les tables
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Base de données connectée')

    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('❌ Un administrateur existe déjà dans la base de données.')
      console.log(`📧 Email: ${existingAdmin.email}`)
      return
    }

    // Données de l'administrateur par défaut
    const adminData = {
      name: 'Administrateur',
      email: 'admin@acge.local',
      password: 'admin123',
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

    console.log('\n✅ Base de données de développement configurée avec succès !')
    console.log('\n🔐 Identifiants de connexion :')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Mot de passe:', adminData.password)
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !')
    console.log('\n🚀 Vous pouvez maintenant démarrer l\'application avec: npm run dev')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
    console.log('\n💡 Conseil: Essayez de supprimer prisma/dev.db et relancez ce script')
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
setupDevDatabase()
