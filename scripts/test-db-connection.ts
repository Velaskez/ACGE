import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Tester la connexion
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected! Found ${userCount} users.`)
    
    // Vérifier si un utilisateur admin existe
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email)
    } else {
      console.log('⚠️ No admin user found. Creating one...')
      
      // Créer un utilisateur admin de test
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          password: 'admin123', // À hasher en production
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      
      console.log('✅ Admin user created:', newAdmin.email)
    }
    
    // Compter les documents et dossiers
    const [documentCount, folderCount] = await Promise.all([
      prisma.document.count(),
      prisma.folder.count()
    ])
    
    console.log(`📊 Database stats:`)
    console.log(`   - Documents: ${documentCount}`)
    console.log(`   - Folders: ${folderCount}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('Error details:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
