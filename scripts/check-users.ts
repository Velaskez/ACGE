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

async function checkUsers() {
  try {
    console.log('👥 Vérification des utilisateurs dans la base...')
    
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
    
    console.log(`📊 Nombre total d'utilisateurs : ${users.length}`)
    
    if (users.length > 0) {
      console.log('\n👤 Utilisateurs trouvés :')
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`)
        console.log(`      - ID: ${user.id}`)
        console.log(`      - Nom: ${user.name || 'Non défini'}`)
        console.log(`      - Rôle: ${user.role}`)
        console.log(`      - Créé le: ${user.createdAt.toLocaleDateString()}`)
        console.log('')
      })
    } else {
      console.log('❌ Aucun utilisateur trouvé')
    }
    
  } catch (error: any) {
    console.error('❌ Erreur :', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()
