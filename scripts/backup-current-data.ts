import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function backupCurrentData() {
  console.log('💾 Sauvegarde des données actuelles...\n')
  
  try {
    await prisma.$connect()
    
    // Sauvegarder les utilisateurs
    console.log('1. 👥 Sauvegarde des utilisateurs...')
    const users = await prisma.user.findMany()
    console.log(`   ${users.length} utilisateurs sauvegardés`)
    
    // Sauvegarder les dossiers
    console.log('2. 📁 Sauvegarde des dossiers...')
    const folders = await prisma.folder.findMany()
    console.log(`   ${folders.length} dossiers sauvegardés`)
    
    // Sauvegarder les documents
    console.log('3. 📄 Sauvegarde des documents...')
    const documents = await prisma.document.findMany()
    console.log(`   ${documents.length} documents sauvegardés`)
    
    // Sauvegarder les versions
    console.log('4. 📋 Sauvegarde des versions...')
    const versions = await prisma.documentVersion.findMany()
    console.log(`   ${versions.length} versions sauvegardées`)
    
    // Créer le fichier de sauvegarde
    const backup = {
      timestamp: new Date().toISOString(),
      users,
      folders,
      documents,
      versions
    }
    
    const backupPath = join(process.cwd(), 'backup-current-data.json')
    writeFileSync(backupPath, JSON.stringify(backup, null, 2))
    
    console.log(`\n✅ Sauvegarde créée: ${backupPath}`)
    console.log(`📊 Données sauvegardées:`)
    console.log(`   - ${users.length} utilisateurs`)
    console.log(`   - ${folders.length} dossiers`)
    console.log(`   - ${documents.length} documents`)
    console.log(`   - ${versions.length} versions`)
    
    console.log('\n💡 Pour restaurer après migration:')
    console.log('   npm run restore:backup')
    
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backupCurrentData().catch(console.error)
