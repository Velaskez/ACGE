import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanTestFolders() {
  try {
    console.log('🧹 Suppression des dossiers de test...')
    
    const deletedFolders = await prisma.folder.deleteMany({
      where: {
        name: {
          in: ['Dossier Test Numérotation', 'Dossier Test 2']
        }
      }
    })
    
    console.log(`✅ ${deletedFolders.count} dossiers de test supprimés`)
    
    // Vérifier les dossiers restants
    const remainingFolders = await prisma.folder.findMany({
      orderBy: { folderNumber: 'asc' }
    })
    
    console.log('\n📊 Dossiers restants:')
    if (remainingFolders.length > 0) {
      remainingFolders.forEach(folder => {
        console.log(`   N°${folder.folderNumber}: ${folder.name}`)
      })
    } else {
      console.log('   Aucun dossier')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanTestFolders()
