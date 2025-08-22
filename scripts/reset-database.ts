import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🔄 Réinitialisation complète de la base de données...')

  try {
    // Supprimer toutes les données existantes
    console.log('🗑️ Suppression des données existantes...')
    
    await prisma.documentVersion.deleteMany()
    await prisma.documentShare.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.document.deleteMany()
    await prisma.folder.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Données supprimées')

    // Créer les utilisateurs de test
    console.log('👥 Création des utilisateurs de test...')
    
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@acge.com',
        name: 'Admin ACGE',
        password: adminPassword,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin créé:', admin.email)

    const secretairePassword = await bcrypt.hash('secretaire123', 12)
    const secretaire = await prisma.user.create({
      data: {
        email: 'secretaire@acge.com',
        name: 'Secrétaire ACGE',
        password: secretairePassword,
        role: 'SECRETAIRE'
      }
    })
    console.log('✅ Secrétaire créé:', secretaire.email)

    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.create({
      data: {
        email: 'user@acge.com',
        name: 'User ACGE',
        password: userPassword,
        role: 'SECRETAIRE'
      }
    })
    console.log('✅ User créé:', user.email)

    // Créer des dossiers de test
    console.log('📁 Création des dossiers de test...')
    
    const folder1 = await prisma.folder.create({
      data: {
        name: 'Documents Administratifs',
        description: 'Documents administratifs de l\'ACGE',
        authorId: admin.id
      }
    })
    console.log('✅ Dossier créé:', folder1.name)

    const folder2 = await prisma.folder.create({
      data: {
        name: 'Rapports',
        description: 'Rapports mensuels et annuels',
        authorId: admin.id
      }
    })
    console.log('✅ Dossier créé:', folder2.name)

    // Créer des notifications de test
    console.log('🔔 Création des notifications de test...')
    
    await prisma.notification.createMany({
      data: [
        {
          type: 'info',
          title: 'Bienvenue sur ACGE',
          message: 'Votre compte a été créé avec succès',
          userId: admin.id,
          isRead: false
        },
        {
          type: 'alert',
          title: 'Nouveau document',
          message: 'Un nouveau document a été ajouté dans vos dossiers',
          userId: admin.id,
          isRead: false
        },
        {
          type: 'success',
          title: 'Upload réussi',
          message: 'Votre document a été uploadé avec succès',
          userId: admin.id,
          isRead: true
        }
      ]
    })
    console.log('✅ Notifications créées')

    // Créer un document de test
    console.log('📄 Création d\'un document de test...')
    
    const doc1 = await prisma.document.create({
      data: {
        title: 'Rapport Annuel 2024',
        description: 'Rapport annuel des activités de l\'ACGE',
        authorId: admin.id,
        folderId: folder2.id,
        isPublic: false
      }
    })

    await prisma.documentVersion.create({
      data: {
        documentId: doc1.id,
        versionNumber: 1,
        fileName: 'rapport-annuel-2024.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        filePath: '/uploads/rapport-annuel-2024.pdf',
        changeLog: 'Version initiale',
        createdById: admin.id
      }
    })
    console.log('✅ Document créé:', doc1.title)

    // Afficher le résumé
    console.log('\n📊 Résumé de la base de données:')
    const userCount = await prisma.user.count()
    const folderCount = await prisma.folder.count()
    const documentCount = await prisma.document.count()
    const notificationCount = await prisma.notification.count()

    console.log(`  - Utilisateurs: ${userCount}`)
    console.log(`  - Dossiers: ${folderCount}`)
    console.log(`  - Documents: ${documentCount}`)
    console.log(`  - Notifications: ${notificationCount}`)

    console.log('\n✅ Base de données réinitialisée avec succès!')
    console.log('\n🔑 Identifiants de test:')
    console.log('  Admin: admin@acge.com / admin123')
    console.log('  Manager: manager@acge.com / manager123')
    console.log('  User: user@acge.com / user123')

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
    throw error
  }
}

resetDatabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
