import { PrismaClient } from '@prisma/client'
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function setupPrismaPlatform() {
  console.log('🌐 Configuration Prisma Data Platform\n')
  
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la base locale établie')
    
    // 1. Vérifier l'état actuel
    console.log('\n1. 📊 État actuel de la base locale...')
    const [users, documents, folders, versions] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.folder.count(),
      prisma.documentVersion.count()
    ])
    
    console.log(`   👥 Utilisateurs: ${users}`)
    console.log(`   📄 Documents: ${documents}`)
    console.log(`   📁 Dossiers: ${folders}`)
    console.log(`   📋 Versions: ${versions}`)
    
    // 2. Instructions pour Prisma Data Platform
    console.log('\n2. 🌐 Configuration Prisma Data Platform...')
    console.log('   📋 Étapes à suivre:')
    console.log('   1. Aller sur https://console.prisma.io/cme8tjr0i00jz1dm3veuwd1xj/cme8tnulp0376yblzsrmsp6q6/environments')
    console.log('   2. Cliquer sur "Create database"')
    console.log('   3. Choisir "PostgreSQL"')
    console.log('   4. Sélectionner votre région préférée')
    console.log('   5. Cliquer sur "Create database"')
    
    // 3. Préparer les données pour la migration
    console.log('\n3. 💾 Préparation des données...')
    
    // Sauvegarder les données actuelles
    const currentData = {
      users: await prisma.user.findMany(),
      folders: await prisma.folder.findMany(),
      documents: await prisma.document.findMany(),
      versions: await prisma.documentVersion.findMany(),
      tags: await prisma.tag.findMany(),
      shares: await prisma.documentShare.findMany(),
      comments: await prisma.comment.findMany(),
      notifications: await prisma.notification.findMany()
    }
    
    const backupPath = join(process.cwd(), 'prisma-platform-backup.json')
    writeFileSync(backupPath, JSON.stringify(currentData, null, 2))
    
    console.log(`   ✅ Données sauvegardées: ${backupPath}`)
    
    // 4. Instructions pour la nouvelle URL
    console.log('\n4. 🔗 Configuration de la nouvelle URL...')
    console.log('   Une fois la base créée sur Prisma Data Platform:')
    console.log('   1. Copier l\'URL de connexion fournie')
    console.log('   2. Mettre à jour .env.local avec la nouvelle DATABASE_URL')
    console.log('   3. Exécuter: npm run migrate:to-platform')
    
    // 5. Créer le script de migration
    console.log('\n5. 📝 Création du script de migration...')
    
    const migrationScript = `import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateToPlatform() {
  console.log('🚀 Migration vers Prisma Data Platform...\\n')
  
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la nouvelle base établie')
    
    // Lire les données sauvegardées
    const backupPath = join(process.cwd(), 'prisma-platform-backup.json')
    const data = JSON.parse(readFileSync(backupPath, 'utf8'))
    
    console.log('📊 Données à migrer:')
    console.log(\`   - \${data.users.length} utilisateurs\`)
    console.log(\`   - \${data.folders.length} dossiers\`)
    console.log(\`   - \${data.documents.length} documents\`)
    console.log(\`   - \${data.versions.length} versions\`)
    console.log(\`   - \${data.tags.length} tags\`)
    console.log(\`   - \${data.shares.length} partages\`)
    console.log(\`   - \${data.comments.length} commentaires\`)
    console.log(\`   - \${data.notifications.length} notifications\`)
    
    // Migrer les données dans l'ordre
    console.log('\\n🔄 Migration des données...')
    
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
    
    console.log('\\n✅ Migration terminée avec succès!')
    console.log('🎉 Votre base de données est maintenant sur Prisma Data Platform!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateToPlatform().catch(console.error)
`
    
    const migrationScriptPath = join(process.cwd(), 'scripts', 'migrate-to-platform.ts')
    writeFileSync(migrationScriptPath, migrationScript)
    
    console.log(`   ✅ Script créé: ${migrationScriptPath}`)
    
    // 6. Mettre à jour package.json
    console.log('\n6. 📦 Mise à jour de package.json...')
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    
    if (!packageJson.scripts['migrate:to-platform']) {
      packageJson.scripts['migrate:to-platform'] = 'tsx scripts/migrate-to-platform.ts'
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('   ✅ Script ajouté à package.json')
    }
    
    console.log('\n🎉 Configuration Prisma Data Platform terminée!')
    console.log('\n📋 Prochaines étapes:')
    console.log('1. Créer la base sur Prisma Data Platform')
    console.log('2. Mettre à jour DATABASE_URL dans .env.local')
    console.log('3. Exécuter: npm run migrate:to-platform')
    console.log('4. Vérifier avec: npm run prisma:manage')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPrismaPlatform().catch(console.error)
