import { PrismaClient } from '@prisma/client'
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

async function findAdminInfo() {
  try {
    console.log('🔍 Recherche des informations administrateur...')
    
    // Récupérer tous les utilisateurs avec rôle ADMIN
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Nombre d'administrateurs trouvés : ${adminUsers.length}`)
    
    if (adminUsers.length > 0) {
      console.log('\n👑 Administrateurs :')
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`)
        console.log(`      - ID: ${user.id}`)
        console.log(`      - Nom: ${user.name || 'Non défini'}`)
        console.log(`      - Rôle: ${user.role}`)
        console.log(`      - Créé le: ${user.createdAt.toLocaleDateString()}`)
        console.log('')
      })
    }
    
    // Récupérer tous les utilisateurs pour voir s'il y en a d'autres
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`📋 Tous les utilisateurs (${allUsers.length}) :`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`)
    })
    
    console.log('\n💡 Pour vous connecter :')
    console.log('   1. Allez sur https://acge-gabon.com')
    console.log('   2. Utilisez l\'email de l\'administrateur trouvé ci-dessus')
    console.log('   3. Si vous ne connaissez pas le mot de passe, vous devrez le réinitialiser')
    
  } catch (error: any) {
    console.error('❌ Erreur :', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Le serveur MySQL n\'est pas accessible depuis votre machine locale.')
      console.log('   Cela est normal car LWS limite l\'accès aux IPs autorisées.')
      console.log('   Testez la connexion depuis l\'application déployée sur Vercel.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

findAdminInfo()
