import { PrismaClient } from '@prisma/client'

console.log('🔍 Démarrage du test de connexion SQLite...')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function testSimple() {
  try {
    console.log('📡 Tentative de connexion...')
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    const userCount = await prisma.user.count()
    console.log(`👥 Nombre d'utilisateurs : ${userCount}`)
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      })
      console.log('👤 Utilisateurs trouvés :', users)
    }
    
  } catch (error) {
    console.error('❌ Erreur :', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Connexion fermée')
  }
}

testSimple()
