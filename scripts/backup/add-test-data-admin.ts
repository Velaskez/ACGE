import { PrismaClient } from '@prisma/client'
import { generateFolderNumber } from '../../src/lib/folder-numbering'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Ajout de données de test pour l\'admin existant...')

  try {
    // Récupérer l'utilisateur admin existant
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    })

    if (!adminUser) {
      console.log('❌ Aucun utilisateur admin trouvé')
      return
    }

    console.log('✅ Utilisateur admin trouvé:', adminUser.email)

    // Créer quelques dossiers pour l'admin
    const folders = await Promise.all([
      prisma.folder.create({
        data: {
          folderNumber: await generateFolderNumber(),
          name: 'Comptabilité',
          description: 'Documents comptables et financiers',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          folderNumber: await generateFolderNumber(),
          name: 'Factures',
          description: 'Factures clients et fournisseurs',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          folderNumber: await generateFolderNumber(),
          name: 'Contrats',
          description: 'Contrats et accords',
          authorId: adminUser.id
        }
      }),
      prisma.folder.create({
        data: {
          folderNumber: await generateFolderNumber(),
          name: 'Rapports',
          description: 'Rapports et analyses',
          authorId: adminUser.id
        }
      })
    ])

    console.log('✅ Dossiers créés:', folders.length)

    // Créer quelques documents de test avec leurs versions
    const documents = []
    
    // Document 1: Rapport Financier
    const doc1 = await prisma.document.create({
      data: {
        title: 'Rapport Financier 2024',
        description: 'Rapport financier annuel',
        authorId: adminUser.id,
        folderId: folders[0].id // Comptabilité
      }
    })
    
    const version1 = await prisma.documentVersion.create({
      data: {
        fileName: 'rapport_financier_2024.pdf',
        fileSize: 2457600, // 2.4 MB
        fileType: 'application/pdf',
        filePath: '/uploads/test/rapport_financier_2024.pdf',
        documentId: doc1.id,
        createdById: adminUser.id
      }
    })
    
    await prisma.document.update({
      where: { id: doc1.id },
      data: { currentVersionId: version1.id }
    })
    
    documents.push(doc1)

    console.log('✅ Documents créés:', documents.length)

    console.log('\n🎉 Données de test ajoutées avec succès!')
    console.log(`   📁 Dossiers: ${folders.length}`)
    console.log(`   📄 Documents: ${documents.length}`)

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
