import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSidebarFix() {
  try {
    console.log('🧪 Test de la sidebar après corrections...')
    
    // Vérifier les dossiers existants
    const folders = await prisma.folder.findMany({
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5 // Limiter à 5 dossiers pour la sidebar
    })
    
    console.log(`📊 Dossiers disponibles pour la sidebar: ${folders.length}`)
    
    folders.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (${folder.folderNumber})`)
      console.log(`      Documents: ${folder._count.documents}`)
      console.log(`      Modifié: ${folder.updatedAt.toLocaleDateString()}`)
    })
    
    // Vérifier les statistiques
    const totalDocuments = await prisma.document.count()
    const totalFolders = await prisma.folder.count()
    
    console.log('\n📈 Statistiques pour la sidebar:')
    console.log(`   Total documents: ${totalDocuments}`)
    console.log(`   Total dossiers: ${totalFolders}`)
    
    console.log('\n✅ La sidebar devrait maintenant:')
    console.log('   - Avoir une hauteur fixe sans dépassement')
    console.log('   - Afficher les dossiers récents avec scroll si nécessaire')
    console.log('   - Afficher les statistiques en bas')
    console.log('   - Être responsive sur mobile')
    
    console.log('\n🎯 Instructions de test:')
    console.log('1. Ouvrez l\'application dans le navigateur')
    console.log('2. Vérifiez que la sidebar ne déborde pas')
    console.log('3. Testez sur différentes tailles d\'écran')
    console.log('4. Vérifiez que le scroll fonctionne dans la section dossiers')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSidebarFix()
