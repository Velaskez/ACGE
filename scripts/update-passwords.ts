import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Mise à jour des mots de passe...')

  try {
    // Mettre à jour le mot de passe pour admin@acge.ga
    const hashedPassword1 = await bcrypt.hash('admin123', 10)
    const user1 = await prisma.user.update({
      where: { email: 'admin@acge.ga' },
      data: { password: hashedPassword1 }
    })
    console.log('✅ Mot de passe mis à jour pour:', user1.email)

    // Mettre à jour le mot de passe pour admin@acge-gabon.com
    const hashedPassword2 = await bcrypt.hash('admin123', 10)
    const user2 = await prisma.user.update({
      where: { email: 'admin@acge-gabon.com' },
      data: { password: hashedPassword2 }
    })
    console.log('✅ Mot de passe mis à jour pour:', user2.email)

    // Créer un nouvel utilisateur avec le mot de passe que vous connaissez
    const hashedPassword3 = await bcrypt.hash('Admin2025!', 10)
    const user3 = await prisma.user.upsert({
      where: { email: 'admin@acge.com' },
      update: { password: hashedPassword3 },
      create: {
        email: 'admin@acge.com',
        name: 'Administrateur Principal ACGE',
        password: hashedPassword3,
        role: 'ADMIN'
      }
    })
    console.log('✅ Utilisateur créé/mis à jour:', user3.email)

    console.log('\n📋 Résumé des utilisateurs :')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name}`)
    })

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
