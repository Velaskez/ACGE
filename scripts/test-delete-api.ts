import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test de l\'API DELETE document...\n')

  // Récupérer l'utilisateur et créer un token
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('❌ Aucun utilisateur trouvé')
    return
  }

  console.log(`👤 Utilisateur: ${user.email}`)

  // Créer un document de test
  const testDocument = await prisma.document.create({
    data: {
      title: 'Document Test API DELETE',
      description: 'Document pour tester l\'API DELETE',
      authorId: user.id,
      isPublic: false
    }
  })

  // Créer une version
  const version = await prisma.documentVersion.create({
    data: {
      documentId: testDocument.id,
      versionNumber: 1,
      fileName: 'test_api_delete.txt',
      fileSize: 1024,
      fileType: 'text/plain',
      filePath: `uploads/${user.id}/test_api_delete.txt`,
      changeLog: 'Version pour test API',
      createdById: user.id
    }
  })

  // Mettre à jour le document pour pointer vers cette version
  await prisma.document.update({
    where: { id: testDocument.id },
    data: { currentVersionId: version.id }
  })

  console.log(`✅ Document créé: ${testDocument.id}`)
  console.log(`✅ Version créée: ${version.id}`)

  // Attendre que le serveur soit prêt
  console.log('\n⏳ Attente du serveur...')
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Test de l'API DELETE
  try {
    console.log('\n🔥 Test DELETE via API...')
    
    const response = await fetch(`http://localhost:3000/api/documents/${testDocument.id}`, {
      method: 'DELETE',
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU1dmNobWwwMDAwOGtpamEzMGl6NXdhIiwiZW1haWwiOiJhZG1pbkBhY2dlLmdhIiwiaWF0IjoxNzU0ODk5OTg5LCJleHAiOjE3NTU1MDQ3ODl9.AZyYjy5bkkWIK-vVImpBG2f8PqdiwbYBfmIyVDtxtrQ'
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log(`✅ API DELETE réussie: ${result.message}`)
      
      // Vérifier que le document n'existe plus
      const deletedDoc = await prisma.document.findUnique({
        where: { id: testDocument.id }
      })
      
      const deletedVersions = await prisma.documentVersion.findMany({
        where: { documentId: testDocument.id }
      })
      
      console.log('\n🔍 Vérification:')
      console.log(`   - Document supprimé: ${!deletedDoc ? '✅' : '❌'}`)
      console.log(`   - Versions supprimées: ${deletedVersions.length === 0 ? '✅' : '❌'}`)
      
      if (!deletedDoc && deletedVersions.length === 0) {
        console.log('\n🎉 API DELETE fonctionne parfaitement!')
      }
    } else {
      const error = await response.text()
      console.log(`❌ Erreur API: ${response.status} - ${error}`)
    }

  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    
    // Si l'API échoue, nettoyer manuellement
    console.log('\n🧹 Nettoyage manuel...')
    await prisma.document.delete({
      where: { id: testDocument.id }
    }).catch(() => {
      console.log('Document déjà supprimé')
    })
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
