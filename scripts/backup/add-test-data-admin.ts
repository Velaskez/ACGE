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

    // Créer quelques documents de test
    const documents = await Promise.all([
      prisma.document.create({
        data: {
          title: 'Rapport Financier 2024',
          description: 'Rapport financier annuel',
          fileName: 'rapport_financier_2024.pdf',
          fileSize: 2457600, // 2.4 MB
          fileType: 'application/pdf',
          filePath: '/uploads/test/rapport_financier_2024.pdf',
          authorId: adminUser.id,
          folderId: folders[0].id // Comptabilité
        }
      }),
      prisma.document.create({
        data: {
          title: 'Présentation Q1 2024',
          description: 'Présentation des résultats du premier trimestre',
          fileName: 'presentation_q1_2024.pptx',
          fileSize: 16777216, // 16 MB
          fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          filePath: '/uploads/test/presentation_q1_2024.pptx',
          authorId: adminUser.id,
          folderId: folders[3].id // Rapports
        }
      }),
      prisma.document.create({
        data: {
          title: 'Budget Prévisionnel',
          description: 'Budget prévisionnel pour l\'année 2024',
          fileName: 'budget_2024.xlsx',
          fileSize: 1258291, // 1.2 MB
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filePath: '/uploads/test/budget_2024.xlsx',
          authorId: adminUser.id,
          folderId: folders[0].id // Comptabilité
        }
      }),
      prisma.document.create({
        data: {
          title: 'Facture Client ABC',
          description: 'Facture pour le client ABC Corp',
          fileName: 'facture_abc_001.pdf',
          fileSize: 524288, // 512 KB
          fileType: 'application/pdf',
          filePath: '/uploads/test/facture_abc_001.pdf',
          authorId: adminUser.id,
          folderId: folders[1].id // Factures
        }
      }),
      prisma.document.create({
        data: {
          title: 'Contrat Prestataire',
          description: 'Contrat avec prestataire externe',
          fileName: 'contrat_prestataire.docx',
          fileSize: 3145728, // 3 MB
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          filePath: '/uploads/test/contrat_prestataire.docx',
          authorId: adminUser.id,
          folderId: folders[2].id // Contrats
        }
      }),
      prisma.document.create({
        data: {
          title: 'Analyse Mensuelle',
          description: 'Analyse des performances mensuelles',
          fileName: 'analyse_janvier_2024.xlsx',
          fileSize: 987654, // ~1 MB
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filePath: '/uploads/test/analyse_janvier_2024.xlsx',
          authorId: adminUser.id,
          folderId: folders[3].id // Rapports
        }
      })
    ])

    console.log('✅ Documents créés:', documents.length)

    // Calculer le total de l'espace utilisé
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0)
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
