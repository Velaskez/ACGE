import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function testDatabaseConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...')
    
    // Test 1: Connexion de base
    console.log('\n📡 Test 1: Connexion de base...')
    await prisma.$connect()
    console.log('✅ Connexion établie avec succès !')
    
    // Test 2: Vérifier les tables
    console.log('\n📋 Test 2: Vérification des tables...')
    const tables = await prisma.$queryRaw`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table'
    `
    console.log('📊 Tables disponibles :', tables)
    
    // Test 3: Vérifier la table users
    console.log('\n👥 Test 3: Vérification de la table users...')
    const userCount = await prisma.user.count()
    console.log(`✅ Nombre d'utilisateurs : ${userCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
      console.log('👤 Utilisateurs trouvés :', users)
    }
    
    // Test 4: Vérifier la configuration
    console.log('\n⚙️ Test 4: Configuration de la base de données...')
    console.log('🔗 URL de connexion :', process.env.DATABASE_URL ? '✅ Configurée' : '❌ Non configurée')
    console.log('🌍 Environnement :', process.env.NODE_ENV || 'development')
    
    console.log('\n🎉 Tous les tests de connexion sont passés !')
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error)
    
    // Suggestions de résolution
    console.log('\n🔧 Suggestions de résolution :')
    console.log('1. Vérifiez que votre base de données locale est démarrée')
    console.log('2. Vérifiez le fichier .env.local')
    console.log('3. Exécutez : npm run db:generate')
    console.log('4. Exécutez : npm run db:push')
    
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
testDatabaseConnection()
