/**
 * Script pour créer des notifications de test
 */

import { PrismaClient } from '@prisma/client'
import { NotificationService } from '../src/lib/notification-service'

const prisma = new PrismaClient()

async function createTestNotifications() {
  try {
    console.log('🔄 Création de notifications de test...')

    // Récupérer un utilisateur de test
    const testUser = await prisma.user.findFirst()
    if (!testUser) {
      console.log('❌ Aucun utilisateur trouvé pour créer les notifications')
      return
    }

    console.log(`👤 Utilisateur de test: ${testUser.name} (${testUser.email})`)

    // 1. Notification de bienvenue
    await NotificationService.create({
      type: 'WELCOME',
      title: 'Bienvenue sur ACGE !',
      message: 'Votre compte a été créé avec succès. Vous pouvez maintenant commencer à utiliser la plateforme.',
      userId: testUser.id,
      data: { version: '1.0.0' }
    })

    // 2. Notification de partage de document
    await NotificationService.create({
      type: 'DOCUMENT_SHARED',
      title: 'Document partagé avec vous',
      message: 'Jean Dupont a partagé le document "Rapport financier 2024" avec vous (lecture).',
      userId: testUser.id,
      data: {
        documentId: 'doc_test_123',
        documentTitle: 'Rapport financier 2024',
        sharedByUserId: 'user_456',
        permission: 'READ'
      }
    })

    // 3. Notification de nouvelle version
    await NotificationService.create({
      type: 'VERSION_ADDED',
      title: 'Nouvelle version disponible',
      message: 'Une nouvelle version du document "Plan stratégique" a été ajoutée par Marie Martin.',
      userId: testUser.id,
      data: {
        documentId: 'doc_test_456',
        documentTitle: 'Plan stratégique',
        versionNumber: 2,
        createdByUserId: 'user_789'
      }
    })

    // 4. Notification système
    await NotificationService.create({
      type: 'SYSTEM',
      title: 'Maintenance prévue',
      message: 'Une maintenance est prévue le 15 janvier 2025 de 22h à 02h. Le service sera temporairement indisponible.',
      userId: testUser.id,
      data: { maintenanceDate: '2025-01-15T22:00:00Z' }
    })

    // 5. Notification de commentaire
    await NotificationService.create({
      type: 'COMMENT_ADDED',
      title: 'Nouveau commentaire',
      message: 'Pierre Durand a ajouté un commentaire sur le document "Budget 2025".',
      userId: testUser.id,
      data: {
        documentId: 'doc_test_789',
        documentTitle: 'Budget 2025',
        commentId: 'comment_123',
        authorId: 'user_101'
      }
    })

    // 6. Notification de version restaurée
    await NotificationService.create({
      type: 'VERSION_RESTORED',
      title: 'Version restaurée',
      message: 'La version 1.2 du document "Procédures internes" a été restaurée par l\'administrateur.',
      userId: testUser.id,
      data: {
        documentId: 'doc_test_101',
        documentTitle: 'Procédures internes',
        versionNumber: 1.2,
        restoredByUserId: 'admin_001'
      }
    })

    // 7. Notification de suppression de document
    await NotificationService.create({
      type: 'DOCUMENT_DELETED',
      title: 'Document supprimé',
      message: 'Le document "Ancien rapport" a été supprimé par l\'administrateur.',
      userId: testUser.id,
      data: {
        documentTitle: 'Ancien rapport',
        deletedByUserId: 'admin_001',
        deletionDate: new Date().toISOString()
      }
    })

    // 8. Notification de partage de dossier
    await NotificationService.create({
      type: 'FOLDER_SHARED',
      title: 'Dossier partagé avec vous',
      message: 'Sophie Bernard a partagé le dossier "Projets 2025" avec vous (écriture).',
      userId: testUser.id,
      data: {
        folderId: 'folder_123',
        folderName: 'Projets 2025',
        sharedByUserId: 'user_202',
        permission: 'WRITE'
      }
    })

    console.log('✅ 8 notifications de test créées avec succès!')
    console.log('📋 Types de notifications créées:')
    console.log('   - WELCOME (Bienvenue)')
    console.log('   - DOCUMENT_SHARED (Document partagé)')
    console.log('   - VERSION_ADDED (Nouvelle version)')
    console.log('   - SYSTEM (Maintenance)')
    console.log('   - COMMENT_ADDED (Nouveau commentaire)')
    console.log('   - VERSION_RESTORED (Version restaurée)')
    console.log('   - DOCUMENT_DELETED (Document supprimé)')
    console.log('   - FOLDER_SHARED (Dossier partagé)')

    // Vérifier les notifications créées
    const notifications = await prisma.notification.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`\n📊 Statistiques:`)
    console.log(`   - Total notifications: ${notifications.length}`)
    console.log(`   - Non lues: ${notifications.filter(n => !n.isRead).length}`)
    console.log(`   - Lues: ${notifications.filter(n => n.isRead).length}`)

    console.log('\n🎉 Test terminé! Vous pouvez maintenant vérifier les notifications dans l\'interface.')

  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestNotifications()
