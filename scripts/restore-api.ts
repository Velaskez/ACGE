import fs from 'fs'
import path from 'path'

async function restoreAPI() {
  try {
    console.log('🔄 Restauration du dossier API...')

    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    const apiBackupDir = path.join(process.cwd(), 'src', 'app', '_api_backup')
    
    if (!fs.existsSync(apiBackupDir)) {
      console.log('✅ Aucune sauvegarde API trouvée')
      return
    }

    // Supprimer le dossier API actuel s'il existe
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true })
    }
    
    // Restaurer le dossier API
    fs.renameSync(apiBackupDir, apiDir)
    console.log('✅ Dossier API restauré')

    console.log('\n📋 Le dossier API a été restauré')
    console.log('📁 API disponible : src/app/api/')

  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error)
  }
}

// Exécuter le script
restoreAPI()
