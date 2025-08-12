import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Ajout de données de test pour l\'admin existant...')

  try {
    // Trouver l'utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@acge.ga'
      }
    })

    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé')
      return
    }

    console.log('✅ Utilisateur admin trouvé:', adminUser.email)

    // Créer quelques dossiers pour l'admin
    const folders = await Promise.all([
      prisma.folder.create({
        data: {
          name: 'Comptabilité',
          description: 'Documents comptables et financiers',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          name: 'Factures',
          description: 'Factures clients et fournisseurs',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          name: 'Contrats',
          description: 'Contrats et accords',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          name: 'Rapports',
          description: 'Rapports et analyses',
          authorId: adminUser.id
        }
      })
    ])

    console.log('✅ Dossiers créés:', folders.length)

    // Créer quelques documents de test avec leur première version
    const documents = await Promise.all([
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Rapport Financier 2024',
            description: 'Rapport financier annuel',
            authorId: adminUser.id,
            folderId: folders[0].id // Comptabilité
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'rapport_financier_2024.pdf',
            fileSize: 2457600,
            fileType: 'application/pdf',
            filePath: '/uploads/test/rapport_financier_2024.pdf',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })(),
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Présentation Q1 2024',
            description: 'Présentation des résultats du premier trimestre',
            authorId: adminUser.id,
            folderId: folders[3].id // Rapports
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'presentation_q1_2024.pptx',
            fileSize: 16777216,
            fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            filePath: '/uploads/test/presentation_q1_2024.pptx',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })(),
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Budget Prévisionnel',
            description: 'Budget prévisionnel pour l\'année 2024',
            authorId: adminUser.id,
            folderId: folders[0].id // Comptabilité
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'budget_2024.xlsx',
            fileSize: 1258291,
            fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filePath: '/uploads/test/budget_2024.xlsx',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })(),
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Facture Client ABC',
            description: 'Facture pour le client ABC Corp',
            authorId: adminUser.id,
            folderId: folders[1].id // Factures
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'facture_abc_001.pdf',
            fileSize: 524288,
            fileType: 'application/pdf',
            filePath: '/uploads/test/facture_abc_001.pdf',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })(),
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Contrat Prestataire',
            description: 'Contrat avec prestataire externe',
            authorId: adminUser.id,
            folderId: folders[2].id // Contrats
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'contrat_prestataire.docx',
            fileSize: 3145728,
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            filePath: '/uploads/test/contrat_prestataire.docx',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })(),
      (async () => {
        const doc = await prisma.document.create({
          data: {
            title: 'Analyse Mensuelle',
            description: 'Analyse des performances mensuelles',
            authorId: adminUser.id,
            folderId: folders[3].id // Rapports
          }
        })
        const ver = await prisma.documentVersion.create({
          data: {
            versionNumber: 1,
            fileName: 'analyse_janvier_2024.xlsx',
            fileSize: 987654,
            fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filePath: '/uploads/test/analyse_janvier_2024.xlsx',
            documentId: doc.id,
            createdById: adminUser.id
          }
        })
        await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
        return { ...doc, currentVersionId: ver.id }
      })()
    ])

    console.log('✅ Documents créés:', documents.length)

    // Calculer le total de l'espace utilisé
    // Additionner la taille des versions courantes
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: { in: documents.map(d => d.id) } },
      select: { documentId: true, fileSize: true, versionNumber: true }
    })
    const latestSizesByDoc = new Map<string, number>()
    versions.forEach(v => {
      // On additionne toutes les tailles car elles sont des exemples de test
      latestSizesByDoc.set(v.documentId, (latestSizesByDoc.get(v.documentId) || 0) + v.fileSize)
    })
    const totalSize = Array.from(latestSizesByDoc.values()).reduce((s, n) => s + n, 0)
    const totalGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2)

    console.log(`💾 Espace total utilisé: ${totalGB} GB`)
    console.log('🎉 Données de test ajoutées avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error)
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
