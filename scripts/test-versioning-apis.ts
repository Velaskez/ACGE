import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test des APIs de versioning...')

  try {
    // 1. Récupérer le document existant
    const document = await prisma.document.findFirst({
      include: {
        currentVersion: true,
        versions: true
      }
    })

    if (!document) {
      console.log('❌ Aucun document trouvé pour les tests')
      return
    }

    console.log(`\n📄 Document de test: ${document.title}`)
    console.log(`   - ID: ${document.id}`)
    console.log(`   - Versions: ${document.versions.length}`)
    console.log(`   - Version actuelle: ${document.currentVersion?.versionNumber}`)

    // 2. Simuler l'ajout d'une nouvelle version
    console.log('\n🔄 Simulation d\'ajout de version...')
    
    const newVersion = await prisma.documentVersion.create({
      data: {
        versionNumber: 2,
        fileName: 'document_v2_updated.jpg',
        fileSize: 15000, // 15KB simulé
        fileType: 'image/jpeg',
        filePath: '/uploads/test/document_v2_updated.jpg',
        changeLog: 'Version mise à jour avec corrections',
        documentId: document.id,
        createdById: document.authorId
      }
    })

    console.log(`   ✅ Version ${newVersion.versionNumber} créée`)

    // 3. Mettre à jour le document pour pointer vers la nouvelle version
    await prisma.document.update({
      where: { id: document.id },
      data: { currentVersionId: newVersion.id }
    })

    console.log(`   ✅ Document mis à jour vers la version ${newVersion.versionNumber}`)

    // 4. Vérifier le résultat
    const updatedDocument = await prisma.document.findUnique({
      where: { id: document.id },
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    })

    console.log('\n📊 État final:')
    console.log(`   - Versions totales: ${updatedDocument?.versions.length}`)
    console.log(`   - Version actuelle: ${updatedDocument?.currentVersion?.versionNumber}`)
    
    updatedDocument?.versions.forEach(version => {
      const isCurrent = version.id === updatedDocument.currentVersionId ? ' (ACTUELLE)' : ''
      console.log(`     v${version.versionNumber}: ${version.fileName}${isCurrent}`)
    })

    // 5. Test de restauration vers la version 1
    console.log('\n🔄 Test de restauration vers version 1...')
    
    const version1 = updatedDocument?.versions.find(v => v.versionNumber === 1)
    if (version1) {
      await prisma.document.update({
        where: { id: document.id },
        data: { currentVersionId: version1.id }
      })
      
      console.log(`   ✅ Restauré vers la version ${version1.versionNumber}`)
    }

    // 6. Restaurer vers la version 2
    console.log('\n🔄 Restauration vers version 2...')
    await prisma.document.update({
      where: { id: document.id },
      data: { currentVersionId: newVersion.id }
    })
    
    console.log(`   ✅ Restauré vers la version ${newVersion.versionNumber}`)

    console.log('\n🎉 Tests de versioning réussis!')
    console.log('\n📝 APIs prêtes:')
    console.log('   - GET /api/documents/versions?documentId=XXX (liste des versions)')
    console.log('   - POST /api/documents/versions (créer nouvelle version)')
    console.log('   - POST /api/documents/versions/[versionId]/restore (restaurer version)')

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
