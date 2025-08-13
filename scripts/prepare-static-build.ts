import fs from 'fs'
import path from 'path'

async function prepareStaticBuild() {
  try {
    console.log('🔧 Préparation de l\'export statique...')

    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    const apiBackupDir = path.join(process.cwd(), 'src', 'app', '_api_backup')
    
    if (!fs.existsSync(apiDir)) {
      console.log('✅ Aucun dossier API trouvé')
      return
    }

    // Sauvegarder le dossier API
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true })
    }
    
    // Renommer le dossier API pour l'export statique
    fs.renameSync(apiDir, apiBackupDir)
    console.log('✅ Dossier API masqué pour l\'export statique')

    console.log('\n📋 Le dossier API a été temporairement masqué')
    console.log('📁 Sauvegarde : src/app/_api_backup/')
    console.log('🔄 Après le build, le dossier sera restauré')

  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error)
  }
}

// Exécuter le script
prepareStaticBuild()
