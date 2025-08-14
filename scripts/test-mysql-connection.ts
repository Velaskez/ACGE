import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à la base de données MySQL...')
    console.log('📡 URL de connexion:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))
    
    // Test de connexion simple
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    // Test de requête simple
    const userCount = await prisma.user.count()
    console.log(`📊 Nombre d'utilisateurs dans la base : ${userCount}`)
    
    // Test de création d'une table si elle n'existe pas
    console.log('🔄 Vérification des tables...')
    const tables = await prisma.$queryRaw`SHOW TABLES`
    console.log('✅ Tables disponibles :', tables)
    
  } catch (error) {
    console.error('❌ Erreur de connexion :', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
