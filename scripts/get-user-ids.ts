import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Récupération des IDs utilisateurs...\n')

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    users.forEach(user => {
      console.log(`ID: ${user.id}`)
      console.log(`Nom: ${user.name}`)
      console.log(`Email: ${user.email}`)
      console.log(`Rôle: ${user.role}`)
      console.log('---')
    })

    console.log('\n✅ IDs récupérés!')

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error)
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
