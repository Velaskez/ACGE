import { PrismaClient } from '@prisma/client'
import { generateFolderNumber } from '../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function testFolderCreation() {
  try {
    console.log('🧪 Test de création de dossier avec numérotation automatique...')
    
    // Récupérer un utilisateur existant pour le test
    const user = await prisma.user.findFirst()
    if (!user) {
      console.log('❌ Aucun utilisateur trouvé pour le test')
      return
    }
    
    console.log(`👤 Utilisateur trouvé: ${user.name} (${user.id})`)
    
    // Créer un dossier de test
    const newFolder = await prisma.folder.create({
      data: {
        folderNumber: await generateFolderNumber(),
        name: 'Dossier Test Numérotation',
        description: 'Test de la numérotation automatique',
        authorId: user.id
      }
    })
    
    console.log('\n✅ Dossier créé avec succès!')
    console.log(`   ID: ${newFolder.id}`)
    console.log(`   📊 Numéro: ${newFolder.folderNumber}`)
    console.log(`   📁 Nom: ${newFolder.name}`)
    console.log(`   📝 Description: ${newFolder.description}`)
    console.log(`   📅 Créé le: ${newFolder.createdAt.toLocaleString()}`)
    
    // Créer un deuxième dossier pour vérifier l'incrémentation
    const secondFolder = await prisma.folder.create({
      data: {
        folderNumber: await generateFolderNumber(),
        name: 'Dossier Test 2',
        description: 'Deuxième dossier de test',
        authorId: user.id
      }
    })
    
    console.log('\n✅ Deuxième dossier créé!')
    console.log(`   📊 Numéro: ${secondFolder.folderNumber}`)
    console.log(`   📁 Nom: ${secondFolder.name}`)
    
    // Vérifier que les numéros sont bien différents et incrémentés
    if (secondFolder.folderNumber === newFolder.folderNumber + 1) {
      console.log('\n🎉 Numérotation automatique fonctionne correctement!')
    } else {
      console.log('\n⚠️  Problème avec la numérotation automatique')
    }
    
    // Afficher tous les dossiers
    const allFolders = await prisma.folder.findMany({
      orderBy: { folderNumber: 'asc' }
    })
    
    console.log('\n📊 Tous les dossiers dans la base:')
    allFolders.forEach(folder => {
      console.log(`   N°${folder.folderNumber}: ${folder.name}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFolderCreation()
