import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Charger les variables d'environnement depuis .env.local
const envPath = join(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  const envConfig = dotenv.parse(readFileSync(envPath, 'utf8'))
  Object.assign(process.env, envConfig)
}

const prisma = new PrismaClient()

async function createNewAdmin() {
  try {
    console.log('👑 Création d\'un nouvel administrateur...')
    
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
    
    console.log('\n🔑 Identifiants de connexion :')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Mot de passe: ${adminPassword}`)
    console.log('\n🌐 Pour vous connecter :')
    console.log('   1. Allez sur https://acge-gabon.com')
    console.log('   2. Utilisez les identifiants ci-dessus')
    
  } catch (error: any) {
    console.error('❌ Erreur :', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Le serveur MySQL n\'est pas accessible depuis votre machine locale.')
      console.log('   Exécutez ce script après le déploiement sur Vercel.')
      console.log('   Ou utilisez phpMyAdmin pour créer l\'utilisateur manuellement.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

createNewAdmin()
