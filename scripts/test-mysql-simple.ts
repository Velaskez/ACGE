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

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à la base de données...')
    console.log('📡 URL de connexion:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))
    
    // Test de connexion simple
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    // Test de requête simple
    const userCount = await prisma.user.count()
    console.log(`📊 Nombre d'utilisateurs dans la base : ${userCount}`)
    
    // Vérifier l'utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@acge.local' }
    })
    
    if (adminUser) {
      console.log('✅ Utilisateur admin trouvé :', adminUser.email)
      console.log('   ID:', adminUser.id)
      console.log('   Rôle:', adminUser.role)
    } else {
      console.log('⚠️ Utilisateur admin non trouvé')
    }
    
    // Compter les autres entités
    const stats = {
      documents: await prisma.document.count(),
      folders: await prisma.folder.count(),
      notifications: await prisma.notification.count()
    }
    
    console.log('\n📊 Statistiques :')
    console.log(`   - Documents: ${stats.documents}`)
    console.log(`   - Dossiers: ${stats.folders}`)
    console.log(`   - Notifications: ${stats.notifications}`)
    
  } catch (error: any) {
    console.error('❌ Erreur de connexion :', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solutions possibles:')
      console.log('   1. Vérifiez que le serveur MySQL est accessible')
      console.log('   2. Vérifiez les informations de connexion dans .env.local')
      console.log('   3. Vérifiez que votre IP est autorisée dans LWS')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
