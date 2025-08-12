/**
 * Script pour ajouter la table notifications à la base de données
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addNotificationsTable() {
  try {
    console.log('🔄 Ajout de la table notifications...')

    // Créer la table notifications avec PostgreSQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "data" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT NOT NULL,
        CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `

    console.log('✅ Table notifications créée avec succès!')

    // Test - Créer une notification de test
    const testUser = await prisma.user.findFirst()
    if (testUser) {
      await prisma.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Bienvenue !',
          message: 'Le système de notifications est maintenant actif.',
          userId: testUser.id,
          data: { version: '1.0.0' }
        }
      })
      console.log('✅ Notification de test créée!')
    }

    console.log('🎉 Migration terminée avec succès!')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addNotificationsTable()
