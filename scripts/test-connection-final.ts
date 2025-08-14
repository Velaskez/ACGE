import { PrismaClient } from '@prisma/client'

console.log('🔍 Test final de connexion...')

const prisma = new PrismaClient()

async function testConnection() {
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
    
    console.log('\n🎉 Test de connexion réussi !')
    console.log('🔑 Vous pouvez maintenant vous connecter avec :')
    console.log('📧 Email : admin@acge-gabon.com')
    console.log('🔑 Mot de passe : admin123')
    
  } catch (error) {
    console.error('❌ Erreur :', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Connexion fermée')
  }
}

testConnection()
