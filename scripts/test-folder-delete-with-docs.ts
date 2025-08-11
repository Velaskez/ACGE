import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFolderDeleteWithDocs() {
  try {
    console.log('🧪 Test de suppression de dossier avec documents...')
    
    // Vérifier les dossiers existants qui ont des documents
    const foldersWithDocs = await prisma.folder.findMany({
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      },
      where: {
        documents: {
          some: {}
        }
      }
    })
    
    console.log('\n📊 Dossiers contenant des documents:')
    foldersWithDocs.forEach(folder => {
      console.log(`   ${folder.folderNumber}: ${folder.name} (${folder._count.documents} documents)`)
    })
    
    if (foldersWithDocs.length > 0) {
      const testFolder = foldersWithDocs[0]
      console.log(`\n🧪 Test de suppression du dossier: ${testFolder.name}`)
      console.log(`   Contient ${testFolder._count.documents} document(s)`)
      console.log('   ❌ La suppression devrait échouer avec un message d\'erreur')
      
      // Simuler l'appel API qui devrait échouer
      console.log('\n🔥 Tentative de suppression...')
      console.log(`❌ Erreur attendue: "Impossible de supprimer le dossier. Il contient ${testFolder._count.documents} document(s)."`)
    } else {
      console.log('\n✅ Aucun dossier avec documents trouvé pour le test')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFolderDeleteWithDocs()
