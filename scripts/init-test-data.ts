import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation des données de test...')

  try {
    // Créer un utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@acge.com' },
      update: {},
      create: {
        email: 'admin@acge.com',
        name: 'Admin ACGE',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Utilisateur admin créé:', admin.email)

    // Créer un utilisateur normal
    const userPassword = await bcrypt.hash('user123', 10)
    const user = await prisma.user.upsert({
      where: { email: 'user@acge.com' },
      update: {},
      create: {
        email: 'user@acge.com',
        name: 'User Test',
        password: userPassword,
        role: 'SECRETAIRE'
      }
    })
    
    console.log('✅ Utilisateur test créé:', user.email)

    // Créer quelques dossiers
    const folder1 = await prisma.folder.create({
      data: {
        name: 'Documents Administratifs',
        description: 'Documents administratifs de l\'ACGE',
        authorId: admin.id
      }
    })

    const folder2 = await prisma.folder.create({
      data: {
        name: 'Rapports',
        description: 'Rapports mensuels et annuels',
        authorId: admin.id
      }
    })

    console.log('✅ Dossiers créés')

    // Créer quelques documents avec leurs versions
    const doc1 = await prisma.document.create({
      data: {
        title: 'Rapport Annuel 2024',
        description: 'Rapport d\'activité annuel',
        authorId: admin.id,
        folderId: folder2.id,
        versions: {
          create: {
            versionNumber: 1,
            fileName: 'rapport-2024.pdf',
            fileType: 'application/pdf',
            fileSize: 1024000,
            filePath: '/uploads/rapport-2024.pdf',
            createdById: admin.id
          }
        }
      },
      include: {
        versions: true
      }
    })

    // Mettre à jour le document avec la version courante
    await prisma.document.update({
      where: { id: doc1.id },
      data: {
        currentVersionId: doc1.versions[0].id
      }
    })

    const doc2 = await prisma.document.create({
      data: {
        title: 'Procédures Internes',
        description: 'Document de procédures',
        authorId: admin.id,
        folderId: folder1.id,
        versions: {
          create: {
            versionNumber: 1,
            fileName: 'procedures.pdf',
            fileType: 'application/pdf',
            fileSize: 512000,
            filePath: '/uploads/procedures.pdf',
            createdById: admin.id
          }
        }
      },
      include: {
        versions: true
      }
    })

    // Mettre à jour le document avec la version courante
    await prisma.document.update({
      where: { id: doc2.id },
      data: {
        currentVersionId: doc2.versions[0].id
      }
    })

    console.log('✅ Documents créés')

    // Créer quelques notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: admin.id,
          title: 'Bienvenue sur ACGE',
          message: 'Votre compte administrateur a été créé avec succès',
          type: 'info'
        },
        {
          userId: user.id,
          title: 'Bienvenue',
          message: 'Votre compte utilisateur a été créé',
          type: 'info'
        },
        {
          userId: admin.id,
          title: 'Nouveau document',
          message: 'Un nouveau document a été ajouté',
          type: 'document',
          isRead: false
        }
      ]
    })

    console.log('✅ Notifications créées')

    // Afficher les statistiques
    const stats = {
      users: await prisma.user.count(),
      documents: await prisma.document.count(),
      folders: await prisma.folder.count(),
      notifications: await prisma.notification.count()
    }

    console.log('\n📊 Statistiques finales:')
    console.log('- Utilisateurs:', stats.users)
    console.log('- Documents:', stats.documents)
    console.log('- Dossiers:', stats.folders)
    console.log('- Notifications:', stats.notifications)

    console.log('\n✅ Initialisation terminée avec succès!')
    console.log('\n🔐 Identifiants de connexion:')
    console.log('Admin: admin@acge.com / admin123')
    console.log('User: user@acge.com / user123')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
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