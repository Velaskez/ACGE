import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function restoreBackupData() {
  console.log('🔄 Restauration des données sauvegardées...\n')
  
  try {
    await prisma.$connect()
    
    // Lire le fichier de sauvegarde
    const backupPath = join(process.cwd(), 'backup-current-data.json')
    const backupData = JSON.parse(readFileSync(backupPath, 'utf8'))
    
    console.log(`📅 Sauvegarde du: ${backupData.timestamp}`)
    
    // Restaurer les utilisateurs
    console.log('1. 👥 Restauration des utilisateurs...')
    for (const user of backupData.users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }
    console.log(`   ${backupData.users.length} utilisateurs restaurés`)
    
    // Restaurer les dossiers
    console.log('2. 📁 Restauration des dossiers...')
    for (const folder of backupData.folders) {
      await prisma.folder.upsert({
        where: { id: folder.id },
        update: folder,
        create: folder
      })
    }
    console.log(`   ${backupData.folders.length} dossiers restaurés`)
    
    // Restaurer les documents d'abord (sans currentVersionId)
    console.log('3. 📄 Restauration des documents...')
    for (const document of backupData.documents) {
      const { currentVersionId, ...documentWithoutVersion } = document
      await prisma.document.upsert({
        where: { id: document.id },
        update: documentWithoutVersion,
        create: documentWithoutVersion
      })
    }
    console.log(`   ${backupData.documents.length} documents restaurés`)
    
    // Restaurer les versions
    console.log('4. 📋 Restauration des versions...')
    for (const version of backupData.versions) {
      await prisma.documentVersion.upsert({
        where: { id: version.id },
        update: version,
        create: version
      })
    }
    console.log(`   ${backupData.versions.length} versions restaurées`)
    
    // Mettre à jour les documents avec leurs versions courantes
    console.log('5. 🔄 Mise à jour des versions courantes...')
    for (const document of backupData.documents) {
      if (document.currentVersionId) {
        await prisma.document.update({
          where: { id: document.id },
          data: { currentVersionId: document.currentVersionId }
        })
      }
    }
    console.log(`   Versions courantes mises à jour`)
    
    console.log('\n✅ Restauration terminée avec succès!')
    console.log(`📊 Données restaurées:`)
    console.log(`   - ${backupData.users.length} utilisateurs`)
    console.log(`   - ${backupData.folders.length} dossiers`)
    console.log(`   - ${backupData.documents.length} documents`)
    console.log(`   - ${backupData.versions.length} versions`)
    
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreBackupData().catch(console.error)
