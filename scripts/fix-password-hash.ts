import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPasswordHash() {
  try {
    console.log('🔧 Correction du hash du mot de passe...')
    
    const userId = 'admin-001' // ou l'ID de l'utilisateur
    const correctHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG'
    
    // Mettre à jour le hash du mot de passe
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@acge-gabon.com' },
      data: { password: correctHash }
    })
    
    console.log('✅ Hash du mot de passe corrigé !')
    console.log('👤 Utilisateur mis à jour :', updatedUser.email)
    console.log('🔑 Nouveau hash :', updatedUser.password)
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction :', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
fixPasswordHash()
