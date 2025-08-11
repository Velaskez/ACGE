import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFolderEdit() {
  try {
    console.log('🧪 Test d\'édition de dossier...')
    
    // Créer un dossier de test
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }
    
    const testFolder = await prisma.folder.create({
      data: {
        folderNumber: 'ACGE-2025-888-EDIT',
        name: 'Dossier Test Édition',
        description: 'Description originale',
        authorId: user.id
      }
    })
    
    console.log(`📁 Dossier créé: ${testFolder.name}`)
    console.log(`   Numéro: ${testFolder.folderNumber}`)
    console.log(`   Description: ${testFolder.description}`)
    
    // Simuler l'édition
    const updatedFolder = await prisma.folder.update({
      where: { id: testFolder.id },
      data: {
        name: 'Dossier Test Édition - Modifié',
        description: 'Description modifiée'
      }
    })
    
    console.log('\n✅ Dossier modifié:')
    console.log(`   Nouveau nom: ${updatedFolder.name}`)
    console.log(`   Nouvelle description: ${updatedFolder.description}`)
    console.log(`   Numéro inchangé: ${updatedFolder.folderNumber}`)
    
    // Nettoyer
    await prisma.folder.delete({
      where: { id: testFolder.id }
    })
    
    console.log('\n🧹 Dossier de test supprimé')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFolderEdit()
