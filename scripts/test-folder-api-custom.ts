import { PrismaClient } from '@prisma/client'
import { generateFolderNumberWithInitials } from '../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function testFolderAPICustom() {
  try {
    console.log('🧪 Test de création de dossier avec numérotation personnalisée...')
    
    // Récupérer un utilisateur pour le test
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }
    
    console.log(`👤 Utilisateur: ${user.name}`)
    
    // Tester la création de plusieurs dossiers
    const testFolders = [
      { name: 'Comptabilité Générale', description: 'Gestion comptable principale' },
      { name: 'Ressources Humaines', description: 'Gestion du personnel' }
    ]
    
    for (const folderData of testFolders) {
      console.log(`\n📁 Création: "${folderData.name}"`)
      
      // Générer le numéro
      const folderNumber = await generateFolderNumberWithInitials(folderData.name)
      console.log(`   🔢 Numéro généré: ${folderNumber}`)
      
      // Créer le dossier
      const newFolder = await prisma.folder.create({
        data: {
          folderNumber: folderNumber,
          name: folderData.name,
          description: folderData.description,
          authorId: user.id
        }
      })
      
      console.log(`   ✅ Créé avec ID: ${newFolder.id}`)
    }
    
    // Afficher tous les dossiers
    console.log('\n📊 Tous les dossiers:')
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

testFolderAPICustom()
