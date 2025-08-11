import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { generateFolderNumber } from '../src/lib/folder-numbering'

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
          role: 'USER'
        }
      })

      console.log('✅ Utilisateur de test créé:', testUser.email)

      // Créer quelques dossiers de test
      const folders = await Promise.all([
        prisma.folder.create({
          data: {
            folderNumber: await generateFolderNumber(),
            name: 'Comptabilité',
            description: 'Documents comptables et financiers',
            authorId: testUser.id
          }
        }),
        prisma.folder.create({
          data: {
            folderNumber: await generateFolderNumber(),
            name: 'Factures',
            description: 'Factures clients et fournisseurs',
            authorId: testUser.id
          }
        }),
        prisma.folder.create({
          data: {
            folderNumber: await generateFolderNumber(),
            name: 'Contrats',
            description: 'Contrats et accords',
            authorId: testUser.id
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
            authorId: testUser.id,
            folderId: folders[0].id
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
            authorId: testUser.id
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
            authorId: testUser.id,
            folderId: folders[0].id
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
            authorId: testUser.id,
            folderId: folders[2].id
          }
        })
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
