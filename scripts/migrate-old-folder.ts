import { PrismaClient } from '@prisma/client'
import { generateFolderNumberWithInitials } from '../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function migrateOldFolder() {
  try {
    console.log('🔄 Migration de l\'ancien dossier vers la nouvelle numérotation...')
    
    // Trouver le dossier "Investissements" avec l'ancien format
    const oldFolder = await prisma.folder.findFirst({
      where: {
        folderNumber: '1'
      }
    })
    
    if (oldFolder) {
      console.log(`📁 Trouvé: ${oldFolder.name} (${oldFolder.folderNumber})`)
      
      // Générer un nouveau numéro
      const newFolderNumber = await generateFolderNumberWithInitials(oldFolder.name)
      console.log(`🔢 Nouveau numéro: ${newFolderNumber}`)
      
      // Mettre à jour
      await prisma.folder.update({
        where: { id: oldFolder.id },
        data: { folderNumber: newFolderNumber }
      })
      
      console.log('✅ Migration réussie!')
    } else {
      console.log('ℹ️  Aucun ancien dossier à migrer')
    }
    
    // Afficher tous les dossiers
    console.log('\n📊 Dossiers après migration:')
    const allFolders = await prisma.folder.findMany({
      orderBy: { folderNumber: 'asc' }
    })
    
    allFolders.forEach(folder => {
      console.log(`   ${folder.folderNumber}: ${folder.name}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateOldFolder()
