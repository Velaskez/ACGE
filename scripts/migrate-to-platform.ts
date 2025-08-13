import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateToPlatform() {
  console.log('🚀 Migration vers Prisma Data Platform...\n')
  
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la nouvelle base établie')
    
    // Lire les données sauvegardées
    const backupPath = join(process.cwd(), 'prisma-platform-backup.json')
    const data = JSON.parse(readFileSync(backupPath, 'utf8'))
    
    console.log('📊 Données à migrer:')
    console.log(`   - ${data.users.length} utilisateurs`)
    console.log(`   - ${data.folders.length} dossiers`)
    console.log(`   - ${data.documents.length} documents`)
    console.log(`   - ${data.versions.length} versions`)
    console.log(`   - ${data.tags.length} tags`)
    console.log(`   - ${data.shares.length} partages`)
    console.log(`   - ${data.comments.length} commentaires`)
    console.log(`   - ${data.notifications.length} notifications`)
    
    // Migrer les données dans l'ordre
    console.log('\n🔄 Migration des données...')
    
    // 1. Utilisateurs
    console.log('1. 👥 Migration des utilisateurs...')
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }
    
    // 2. Dossiers
    console.log('2. 📁 Migration des dossiers...')
    for (const folder of data.folders) {
      await prisma.folder.upsert({
        where: { id: folder.id },
        update: folder,
        create: folder
      })
    }
    
    // 3. Tags
    console.log('3. 🏷️ Migration des tags...')
    for (const tag of data.tags) {
      await prisma.tag.upsert({
        where: { name: tag.name },
        update: tag,
        create: tag
      })
    }
    
    // 4. Versions (avant les documents)
    console.log('4. 📋 Migration des versions...')
    for (const version of data.versions) {
      await prisma.documentVersion.upsert({
        where: { id: version.id },
        update: version,
        create: version
      })
    }
    
    // 5. Documents
    console.log('5. 📄 Migration des documents...')
    for (const document of data.documents) {
      const { currentVersionId, ...docWithoutVersion } = document
      await prisma.document.upsert({
        where: { id: document.id },
        update: docWithoutVersion,
        create: docWithoutVersion
      })
    }
    
    // 6. Mettre à jour les versions courantes
    console.log('6. 🔄 Mise à jour des versions courantes...')
    for (const document of data.documents) {
      if (document.currentVersionId) {
        await prisma.document.update({
          where: { id: document.id },
          data: { currentVersionId: document.currentVersionId }
        })
      }
    }
    
    // 7. Partages
    console.log('7. 🔗 Migration des partages...')
    for (const share of data.shares) {
      await prisma.documentShare.upsert({
        where: { id: share.id },
        update: share,
        create: share
      })
    }
    
    // 8. Commentaires
    console.log('8. 💬 Migration des commentaires...')
    for (const comment of data.comments) {
      await prisma.comment.upsert({
        where: { id: comment.id },
        update: comment,
        create: comment
      })
    }
    
    // 9. Notifications
    console.log('9. 🔔 Migration des notifications...')
    for (const notification of data.notifications) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification
      })
    }
    
    console.log('\n✅ Migration terminée avec succès!')
    console.log('🎉 Votre base de données est maintenant sur Prisma Data Platform!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToPlatform().catch(console.error)
