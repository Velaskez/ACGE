import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seed des données de test...')

  try {
    // Vérifier s'il y a déjà des utilisateurs
    const existingUser = await prisma.user.findFirst()
    
    if (!existingUser) {
      // Créer un utilisateur de test
      const testUser = await prisma.user.create({
        data: {
          name: 'Utilisateur Test',
          email: 'test@acge.com',
          password: await hash('password123', 12),
          role: 'SECRETAIRE'
        }
      })

      console.log('✅ Utilisateur de test créé:', testUser.email)

      // Créer quelques dossiers de test
      const folders = await Promise.all([
        prisma.folder.create({
          data: {
            name: 'Comptabilité',
            description: 'Documents comptables et financiers',
            authorId: testUser.id
          }
        }),
        prisma.folder.create({
          data: {
            name: 'Factures',
            description: 'Factures clients et fournisseurs',
            authorId: testUser.id
          }
        }),
        prisma.folder.create({
          data: {
            name: 'Contrats',
            description: 'Contrats et accords',
            authorId: testUser.id
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
              authorId: testUser.id,
              folderId: folders[0].id
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
              createdById: testUser.id
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
              authorId: testUser.id
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
              createdById: testUser.id
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
              authorId: testUser.id,
              folderId: folders[0].id
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
              createdById: testUser.id
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
              authorId: testUser.id,
              folderId: folders[2].id
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
              createdById: testUser.id
            }
          })
          await prisma.document.update({ where: { id: doc.id }, data: { currentVersionId: ver.id } })
          return { ...doc, currentVersionId: ver.id }
        })()
      ])

      console.log('✅ Documents créés:', documents.length)

      // Créer quelques tags
      const tags = await Promise.all([
        prisma.tag.create({
          data: {
            name: 'urgent',
            color: '#ff0000'
          }
        }),
        prisma.tag.create({
          data: {
            name: 'financier',
            color: '#00ff00'
          }
        }),
        prisma.tag.create({
          data: {
            name: 'administratif',
            color: '#0000ff'
          }
        })
      ])

      console.log('✅ Tags créés:', tags.length)

      console.log('🎉 Seed des données de test terminé avec succès!')
    } else {
      console.log('ℹ️ Des utilisateurs existent déjà, aucun seed nécessaire.')
    }

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
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
