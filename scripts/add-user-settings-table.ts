import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addUserSettingsTable() {
  try {
    console.log('🔄 Ajout de la table user_settings...')

    // Créer la table user_settings avec les noms de colonnes en camelCase
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL,
        "emailNotifications" BOOLEAN DEFAULT true,
        "pushNotifications" BOOLEAN DEFAULT false,
        language TEXT DEFAULT 'fr',
        timezone TEXT DEFAULT 'Africa/Libreville',
        "sessionTimeout" INTEGER DEFAULT 15,
        "passwordExpiry" INTEGER DEFAULT 90,
        theme TEXT DEFAULT 'system',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        CONSTRAINT fk_user_settings_user_id FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      )
    `

    console.log('✅ Table user_settings créée avec succès')

    // Créer des paramètres par défaut pour les utilisateurs existants
    const users = await prisma.$queryRaw`
      SELECT id FROM users
    ` as any[]

    console.log(`🔄 Création des paramètres par défaut pour ${users.length} utilisateurs...`)

    for (const user of users) {
      await prisma.$executeRaw`
        INSERT INTO user_settings ("userId", "emailNotifications", "pushNotifications", language, timezone, "sessionTimeout", "passwordExpiry", theme)
        VALUES (${user.id}, true, false, 'fr', 'Africa/Libreville', 15, 90, 'system')
        ON CONFLICT ("userId") DO NOTHING
      `
    }

    console.log('✅ Paramètres par défaut créés pour tous les utilisateurs')

    // Créer un index pour améliorer les performances
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings("userId")
    `

    console.log('✅ Index créé sur userId')

    console.log('🎉 Migration user_settings terminée avec succès !')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le script
addUserSettingsTable()
  .then(() => {
    console.log('✅ Script terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'exécution du script:', error)
    process.exit(1)
  })
