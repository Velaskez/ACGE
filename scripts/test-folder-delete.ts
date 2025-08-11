import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFolderDelete() {
  try {
    console.log('🧪 Test de suppression de dossier...')
    
    // Créer un dossier vide pour tester la suppression
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }
    
    const testFolder = await prisma.folder.create({
      data: {
        folderNumber: 'ACGE-2025-999-TEST',
        name: 'Dossier Test Suppression',
        description: 'Dossier temporaire pour test',
        authorId: user.id
      }
    })
    
    console.log(`📁 Dossier de test créé: ${testFolder.name} (${testFolder.folderNumber})`)
    
    // Vérifier qu'il est vide (pas de documents)
    const documentCount = await prisma.document.count({
      where: { folderId: testFolder.id }
    })
    
    console.log(`📊 Nombre de documents dans le dossier: ${documentCount}`)
    
    if (documentCount === 0) {
      console.log('✅ Le dossier est vide, la suppression devrait fonctionner')
    } else {
      console.log('⚠️  Le dossier contient des documents, la suppression devrait échouer')
    }
    
    // Tester la suppression via API (simulation)
    console.log('🔥 Suppression du dossier...')
    
    await prisma.folder.delete({
      where: { id: testFolder.id }
    })
    
    console.log('✅ Dossier supprimé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFolderDelete()
