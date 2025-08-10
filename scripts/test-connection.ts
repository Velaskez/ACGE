import { PrismaClient } from '@prisma/client'

async function testConnection() {
  console.log('🔍 Variables d\'environnement :')
  console.log('DATABASE_URL:', process.env.DATABASE_URL || 'NON DÉFINIE')
  console.log('NODE_ENV:', process.env.NODE_ENV || 'NON DÉFINIE')
  
  try {
    const prisma = new PrismaClient()
    
    console.log('\n🔌 Test de connexion Prisma...')
    await prisma.$connect()
    console.log('✅ Connexion Prisma réussie !')
    
    // Test d'une requête simple
    const result = await prisma.$queryRaw`SELECT version() as version`
    console.log('📊 Version PostgreSQL:', result)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
  }
}

testConnection()
