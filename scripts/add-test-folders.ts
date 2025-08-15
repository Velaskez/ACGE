import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestFolders() {
  try {
    console.log('🔄 Ajout de dossiers de test...')

    // Vérifier s'il y a un utilisateur, sinon en créer un
    let userId = '1'
    const existingUser = await prisma.user.findFirst()
    
    if (!existingUser) {
      console.log('👤 Création d\'un utilisateur de test...')
      const user = await prisma.user.create({
        data: {
          name: 'Admin Test',
          email: 'admin@test.com',
          password: 'hashedpassword123',
          role: 'ADMIN'
        }
      })
      userId = user.id
      console.log(`✅ Utilisateur créé: ${user.name}`)
    } else {
      userId = existingUser.id
      console.log(`👤 Utilisateur existant utilisé: ${existingUser.name}`)
    }

    // Supprimer les dossiers existants pour éviter les doublons
    await prisma.document.deleteMany({})
    await prisma.folder.deleteMany({})

    // Créer des dossiers de test
    const folders = [
      {
        name: 'Documents Importants',
        description: 'Dossier pour les documents importants de l\'entreprise',
        authorId: userId
      },
      {
        name: 'Rapports Mensuels',
        description: 'Rapports mensuels et analyses',
        authorId: userId
      },
      {
        name: 'Projets en Cours',
        description: 'Documents liés aux projets en cours',
        authorId: userId
      },
      {
        name: 'Archives',
        description: 'Documents archivés',
        authorId: userId
      }
    ]

    const createdFolders = []
    for (const folderData of folders) {
      const folder = await prisma.folder.create({
        data: folderData
      })
      createdFolders.push(folder)
      console.log(`✅ Dossier créé: ${folder.name}`)
    }

    // Ajouter quelques documents de test dans chaque dossier
    const documents = [
      {
        title: 'Rapport Q1 2024',
        fileName: 'rapport-q1-2024.pdf',
        fileType: 'application/pdf',
        folderId: createdFolders[0].id
      },
      {
        title: 'Plan Stratégique',
        fileName: 'plan-strategique.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        folderId: createdFolders[0].id
      },
      {
        title: 'Analyse Financière Janvier',
        fileName: 'analyse-financiere-janvier.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        folderId: createdFolders[1].id
      },
      {
        title: 'Présentation Projet A',
        fileName: 'presentation-projet-a.pptx',
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        folderId: createdFolders[2].id
      }
    ]

    for (const docData of documents) {
      const document = await prisma.document.create({
        data: {
          title: docData.title,
          authorId: userId,
          folderId: docData.folderId,
          versions: {
            create: {
              versionNumber: 1,
              fileName: docData.fileName,
              fileType: docData.fileType,
              fileSize: Math.floor(Math.random() * 1000000) + 10000, // Taille aléatoire entre 10KB et 1MB
              createdById: userId
            }
          }
        }
      })
      console.log(`✅ Document créé: ${document.title}`)
    }

    console.log('🎉 Dossiers et documents de test ajoutés avec succès!')
    
    // Afficher un résumé
    const totalFolders = await prisma.folder.count()
    const totalDocuments = await prisma.document.count()
    
    console.log(`📊 Résumé: ${totalFolders} dossiers, ${totalDocuments} documents`)

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des dossiers de test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestFolders()
