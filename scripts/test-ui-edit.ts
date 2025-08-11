import { PrismaClient } from '@prisma/client'
import { generateFolderNumberWithInitials } from '../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function testUIEdit() {
  try {
    console.log('🧪 Test de l\'interface d\'édition...')
    
    // Créer un dossier de test pour l'interface
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }
    
    const folderNumber = await generateFolderNumberWithInitials('Dossier Interface Test')
    const testFolder = await prisma.folder.create({
      data: {
        folderNumber,
        name: 'Dossier Interface Test',
        description: 'Dossier pour tester l\'interface d\'édition',
        authorId: user.id
      }
    })
    
    console.log(`📁 Dossier créé pour test UI: ${testFolder.name}`)
    console.log(`   Numéro: ${testFolder.folderNumber}`)
    console.log(`   ID: ${testFolder.id}`)
    console.log(`   Description: ${testFolder.description}`)
    
    console.log('\n🎯 Instructions pour tester l\'interface:')
    console.log('1. Allez sur la page /folders')
    console.log('2. Trouvez le dossier "Dossier Interface Test"')
    console.log('3. Cliquez sur les "⋯" puis "Modifier"')
    console.log('4. Modifiez le nom et/ou la description')
    console.log('5. Cliquez sur "Enregistrer"')
    console.log('6. Vérifiez que les modifications sont appliquées')
    
    console.log('\n📊 Dossier disponible pour test:')
    console.log(`   Nom: ${testFolder.name}`)
    console.log(`   Numéro: ${testFolder.folderNumber}`)
    console.log(`   Description: ${testFolder.description}`)
    
    // Ne pas supprimer automatiquement pour permettre le test manuel
    console.log('\n⚠️  Le dossier reste disponible pour test manuel')
    console.log('   Utilisez le script clean-test-folders.ts pour nettoyer')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testUIEdit()
