import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Restauration des documents avec versioning...')

  try {
    // 1. Lire le backup
    if (!fs.existsSync('backup-documents-before-versioning.json')) {
      console.log('❌ Aucun fichier de backup trouvé!')
      return
    }

    const backupData = JSON.parse(fs.readFileSync('backup-documents-before-versioning.json', 'utf8'))
    const documents = backupData.documents

    console.log(`📋 Restauration de ${documents.length} document(s)...`)

    // 2. Restaurer chaque document avec versioning
    for (const oldDoc of documents) {
      console.log(`\n📄 Traitement: ${oldDoc.title}`)

      // Créer ou mettre à jour le document principal (sans les métadonnées de fichier)
      const newDocument = await prisma.document.upsert({
        where: { id: oldDoc.id },
        update: {
          title: oldDoc.title,
          description: oldDoc.description,
          isPublic: oldDoc.isPublic,
          updatedAt: oldDoc.updatedAt,
          folderId: oldDoc.folderId,
        },
        create: {
          id: oldDoc.id, // Conserver le même ID
          title: oldDoc.title,
          description: oldDoc.description,
          isPublic: oldDoc.isPublic,
          createdAt: oldDoc.createdAt,
          updatedAt: oldDoc.updatedAt,
          authorId: oldDoc.authorId,
          folderId: oldDoc.folderId,
          // currentVersionId sera mis à jour après création de la version
        }
      })

      // Créer la première version
      const firstVersion = await prisma.documentVersion.create({
        data: {
          versionNumber: oldDoc.version || 1,
          fileName: oldDoc.fileName,
          fileSize: oldDoc.fileSize,
          fileType: oldDoc.fileType,
          filePath: oldDoc.filePath,
          changeLog: 'Version initiale (migration depuis ancien système)',
          createdAt: oldDoc.createdAt,
          documentId: newDocument.id,
          createdById: oldDoc.authorId
        }
      })

      // Mettre à jour le document pour pointer vers cette version comme version actuelle
      await prisma.document.update({
        where: { id: newDocument.id },
        data: { currentVersionId: firstVersion.id }
      })

      console.log(`   ✅ Document migré avec version ${firstVersion.versionNumber}`)
    }

    console.log('\n🎉 Migration terminée avec succès!')
    console.log('\n📊 Vérification...')

    // 3. Vérifier la migration
    const migratedDocs = await prisma.document.findMany({
      include: {
        currentVersion: true,
        versions: true
      }
    })

    console.log(`✅ ${migratedDocs.length} document(s) migrés`)
    migratedDocs.forEach(doc => {
      console.log(`   - ${doc.title}: ${doc.versions.length} version(s)`)
    })

    // 4. Déplacer le backup
    fs.renameSync('backup-documents-before-versioning.json', 'backup-completed-versioning.json')
    console.log('\n💾 Backup archivé: backup-completed-versioning.json')

  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
