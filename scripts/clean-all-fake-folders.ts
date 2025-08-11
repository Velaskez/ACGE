import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanAllFakeFolders() {
  try {
    console.log('🧹 Suppression de tous les dossiers de test...')
    
    // Supprimer tous les dossiers
    const deletedFolders = await prisma.folder.deleteMany({})
    
    console.log(`✅ ${deletedFolders.count} dossiers supprimés`)
    
    // Vérification
    const remainingFolders = await prisma.folder.count()
    console.log(`📊 Dossiers restants: ${remainingFolders}`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanAllFakeFolders()
