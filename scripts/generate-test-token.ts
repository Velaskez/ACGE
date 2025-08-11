import { sign } from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Récupérer l'utilisateur existant
  const user = await prisma.user.findFirst()
  
  if (!user) {
    console.error('Aucun utilisateur trouvé')
    return
  }

  console.log(`👤 Utilisateur: ${user.email}`)
  console.log(`🆔 ID: ${user.id}`)

  // Générer un token JWT valide
  const token = sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    process.env.NEXTAUTH_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  )

  console.log('\n🔑 Token JWT généré:')
  console.log(token)
  
  console.log('\n📋 Utilisation:')
  console.log(`Cookie: auth-token=${token}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
