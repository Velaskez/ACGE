import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    console.log('Creating test user with hashed password...')
    
    // Supprimer l'ancien utilisateur si existe
    await prisma.user.deleteMany({
      where: { email: 'admin@test.com' }
    })
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Créer le nouvel utilisateur avec mot de passe hashé
    const user = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    })
    
    console.log('✅ User created:', user.email)
    console.log('   ID:', user.id)
    console.log('   Role:', user.role)
    console.log('   Password is hashed')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
