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
    
    // Test de vérification des tables via information_schema
    console.log('🔄 Vérification des tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    ` as Array<{ table_name: string }>
    
    console.log('✅ Tables disponibles :')
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    
    // Vérifier l'utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@acge.local' }
    })
    
    if (adminUser) {
      console.log('✅ Utilisateur admin trouvé :', adminUser.email)
    } else {
      console.log('⚠️ Utilisateur admin non trouvé')
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion :', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
