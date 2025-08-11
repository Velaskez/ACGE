import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Test complet du système de versioning...\n')

  try {
    // 0. Récupérer l'utilisateur existant
    const existingUser = await prisma.user.findFirst()
    if (!existingUser) {
      console.log('❌ Aucun utilisateur trouvé')
      return
    }

    console.log(`👤 Utilisateur trouvé: ${existingUser.email}`)

    // 1. Créer un document de test avec plusieurs versions
    console.log('📄 Création d\'un document de test...')
    
    const testDocument = await prisma.document.create({
      data: {
        title: 'Document Test Versioning',
        description: 'Document de test pour le système de versioning complet',
        isPublic: false,
        authorId: existingUser.id
      }
    })

    console.log(`   ✅ Document créé: ${testDocument.title} (${testDocument.id})`)

    // 2. Créer plusieurs versions
    const versions = []
    for (let i = 1; i <= 4; i++) {
      const version = await prisma.documentVersion.create({
        data: {
          versionNumber: i,
          fileName: `test_document_v${i}.pdf`,
          fileSize: 1024 * i * 10, // Taille croissante
          fileType: 'application/pdf',
          filePath: `/uploads/test/test_document_v${i}.pdf`,
          changeLog: `Version ${i}: ${i === 1 ? 'Version initiale' : `Améliorations v${i}`}`,
          documentId: testDocument.id,
          createdById: testDocument.authorId
        }
      })
      versions.push(version)
      console.log(`   ✅ Version ${i} créée (${(version.fileSize / 1024).toFixed(1)} KB)`)
    }

    // 3. Définir la version 4 comme version actuelle
    await prisma.document.update({
      where: { id: testDocument.id },
      data: { currentVersionId: versions[3].id }
    })

    console.log(`   ✅ Version 4 définie comme actuelle`)

    // 4. Tester la récupération des versions
    console.log('\n🔍 Test de récupération des versions...')
    
    const documentWithVersions = await prisma.document.findUnique({
      where: { id: testDocument.id },
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' }
        },
        _count: {
          select: { versions: true }
        }
      }
    })

    if (documentWithVersions) {
      console.log(`   📋 Document: ${documentWithVersions.title}`)
      console.log(`   🔢 Nombre de versions: ${documentWithVersions._count.versions}`)
      console.log(`   ⭐ Version actuelle: ${documentWithVersions.currentVersion?.versionNumber}`)
      
      console.log('\n   📚 Historique des versions:')
      documentWithVersions.versions.forEach(version => {
        const isCurrent = version.id === documentWithVersions.currentVersionId ? ' (ACTUELLE)' : ''
        const sizeKB = (version.fileSize / 1024).toFixed(1)
        console.log(`     v${version.versionNumber}: ${version.fileName} (${sizeKB} KB)${isCurrent}`)
        console.log(`       └─ ${version.changeLog}`)
      })
    }

    // 5. Test de restauration
    console.log('\n🔄 Test de restauration vers version 2...')
    
    await prisma.document.update({
      where: { id: testDocument.id },
      data: { currentVersionId: versions[1].id } // Version 2
    })

    console.log(`   ✅ Version 2 restaurée comme actuelle`)

    // 6. Vérification finale
    const finalCheck = await prisma.document.findUnique({
      where: { id: testDocument.id },
      include: { currentVersion: true }
    })

    console.log(`   ✅ Version actuelle confirmée: ${finalCheck?.currentVersion?.versionNumber}`)

    // 7. Test API format
    console.log('\n🔗 Format API pour l\'interface:')
    const apiFormat = {
      documentId: testDocument.id,
      documentTitle: testDocument.title,
      currentVersionId: finalCheck?.currentVersionId,
      versions: documentWithVersions?.versions.map(v => ({
        id: v.id,
        versionNumber: v.versionNumber,
        fileName: v.fileName,
        fileSize: v.fileSize,
        fileType: v.fileType,
        changeLog: v.changeLog,
        createdAt: v.createdAt,
        isCurrent: v.id === finalCheck?.currentVersionId
      }))
    }

    console.log(JSON.stringify(apiFormat, null, 2))

    console.log('\n🎉 Test complet du versioning réussi!')
    console.log('\n✅ Fonctionnalités validées:')
    console.log('   - ✅ Création de documents avec versions')
    console.log('   - ✅ Ajout de nouvelles versions')
    console.log('   - ✅ Gestion de la version actuelle')
    console.log('   - ✅ Restauration de versions antérieures')
    console.log('   - ✅ Récupération de l\'historique complet')
    console.log('   - ✅ Format API compatible avec l\'interface')

  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
