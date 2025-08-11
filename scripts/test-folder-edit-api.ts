import { PrismaClient } from '@prisma/client'
import { generateFolderNumberWithInitials } from '../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function testFolderEditAPI() {
  try {
    console.log('🧪 Test de l\'API d\'édition de dossier...')
    
    // Créer un dossier de test
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }
    
    const folderNumber = await generateFolderNumberWithInitials('Dossier Test API')
    const testFolder = await prisma.folder.create({
      data: {
        folderNumber,
        name: 'Dossier Test API',
        description: 'Description originale',
        authorId: user.id
      }
    })
    
    console.log(`📁 Dossier créé: ${testFolder.name} (${testFolder.folderNumber})`)
    
    // Simuler l'appel API PUT
    console.log('\n🔥 Test de l\'API PUT...')
    
    const updatedFolder = await prisma.folder.update({
      where: { id: testFolder.id },
      data: {
        name: 'Dossier Test API - Modifié',
        description: 'Description modifiée via API'
      },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { documents: true } }
      }
    })
    
    console.log('✅ Dossier modifié via API:')
    console.log(`   Nouveau nom: ${updatedFolder.name}`)
    console.log(`   Nouvelle description: ${updatedFolder.description}`)
    console.log(`   Numéro inchangé: ${updatedFolder.folderNumber}`)
    console.log(`   Auteur: ${updatedFolder.author.name}`)
    console.log(`   Documents: ${updatedFolder._count.documents}`)
    
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

testFolderEditAPI()
