import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test de suppression de document avec versioning...\n')

  // Récupérer l'utilisateur
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('❌ Aucun utilisateur trouvé')
    return
  }

  console.log(`👤 Utilisateur: ${user.email}`)

  // Créer un document de test avec plusieurs versions
  console.log('\n📝 Création d\'un document de test...')
  
  const testDocument = await prisma.document.create({
    data: {
      title: 'Document Test Suppression',
      description: 'Document créé pour tester la suppression',
      authorId: user.id,
      isPublic: false
    }
  })

  console.log(`✅ Document créé: ${testDocument.id}`)

  // Créer quelques versions
  const version1 = await prisma.documentVersion.create({
    data: {
      documentId: testDocument.id,
      versionNumber: 1,
      fileName: 'test_delete_v1.txt',
      fileSize: 1024,
      fileType: 'text/plain',
      filePath: `uploads/${user.id}/test_delete_v1.txt`,
      changeLog: 'Version initiale',
      createdById: user.id
    }
  })

  const version2 = await prisma.documentVersion.create({
    data: {
      documentId: testDocument.id,
      versionNumber: 2,
      fileName: 'test_delete_v2.txt',
      fileSize: 2048,
      fileType: 'text/plain',
      filePath: `uploads/${user.id}/test_delete_v2.txt`,
      changeLog: 'Version mise à jour',
      createdById: user.id
    }
  })

  // Mettre à jour le document pour pointer vers la version 2
  await prisma.document.update({
    where: { id: testDocument.id },
    data: { currentVersionId: version2.id }
  })

  console.log(`✅ Version 1 créée: ${version1.id}`)
  console.log(`✅ Version 2 créée: ${version2.id} (actuelle)`)

  // Vérifier le document avec ses versions
  const documentWithVersions = await prisma.document.findUnique({
    where: { id: testDocument.id },
    include: {
      currentVersion: true,
      versions: true,
      _count: {
        select: {
          versions: true
        }
      }
    }
  })

  if (documentWithVersions) {
    console.log('\n📊 État avant suppression:')
    console.log(`   - Document: ${documentWithVersions.title}`)
    console.log(`   - Version actuelle: ${documentWithVersions.currentVersion?.versionNumber}`)
    console.log(`   - Nombre de versions: ${documentWithVersions._count.versions}`)
    console.log(`   - Chemins des fichiers:`)
    documentWithVersions.versions.forEach(v => {
      console.log(`     * v${v.versionNumber}: ${v.filePath}`)
    })
  }

  // Test de simulation de suppression (affichage de ce qui serait supprimé)
  console.log('\n🗑️  Simulation de suppression:')
  console.log(`   - Document à supprimer: ${testDocument.id}`)
  console.log(`   - Fichiers qui seraient supprimés:`)
  
  if (documentWithVersions) {
    for (const version of documentWithVersions.versions) {
      console.log(`     * ${version.filePath}`)
    }
  }

  // Effectuer la vraie suppression
  console.log('\n⚠️  Suppression effective...')
  
  await prisma.document.delete({
    where: { id: testDocument.id }
  })

  console.log('✅ Document supprimé avec succès!')

  // Vérifier que tout a été supprimé
  const deletedDoc = await prisma.document.findUnique({
    where: { id: testDocument.id }
  })

  const remainingVersions = await prisma.documentVersion.findMany({
    where: { documentId: testDocument.id }
  })

  console.log('\n🔍 Vérification après suppression:')
  console.log(`   - Document existe: ${deletedDoc ? 'Oui ❌' : 'Non ✅'}`)
  console.log(`   - Versions restantes: ${remainingVersions.length} ${remainingVersions.length === 0 ? '✅' : '❌'}`)

  if (remainingVersions.length === 0) {
    console.log('\n🎉 Suppression cascade réussie!')
  } else {
    console.log('\n❌ Problème: des versions orphelines existent')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
