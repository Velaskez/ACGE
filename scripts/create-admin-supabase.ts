import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('👑 Création de l\'administrateur...')
    const adminEmail = 'admin@acge-gabon.com'
    const adminPassword = 'Admin2025!'
    const adminName = 'Administrateur ACGE'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingUser) {
      console.log('⚠️ L\'utilisateur existe déjà')
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          name: adminName
        }
      })
      console.log('✅ Mot de passe mis à jour')
    } else {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'ADMIN'
        }
      })
      console.log('✅ Nouvel administrateur créé')
    }
    
    console.log('🎯 Admin configuré :', adminEmail)
    console.log('🔑 Mot de passe :', adminPassword)
  } catch (error) {
    console.error('❌ Erreur :', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
