import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function buildLWS() {
  try {
    console.log('🏗️ Construction de l\'application pour LWS...')

    // Vérifier que .env.production existe
    const envPath = path.join(process.cwd(), '.env.production')
    if (!fs.existsSync(envPath)) {
      console.error('❌ Fichier .env.production manquant')
      console.log('Exécutez d\'abord : npm run setup:lws')
      return
    }

    // Nettoyer les builds précédents
    console.log('🧹 Nettoyage des builds précédents...')
    if (fs.existsSync('.next')) {
      fs.rmSync('.next', { recursive: true, force: true })
    }
    if (fs.existsSync('out')) {
      fs.rmSync('out', { recursive: true, force: true })
    }

    // Installer les dépendances
    console.log('📦 Installation des dépendances...')
    execSync('npm install', { stdio: 'inherit' })

    // Générer le client Prisma
    console.log('🔧 Génération du client Prisma...')
    execSync('npm run db:generate', { stdio: 'inherit' })

    // Build de l'application
    console.log('🏗️ Build de l\'application...')
    execSync('npm run build', { stdio: 'inherit' })

    console.log('\n✅ Build terminé avec succès !')
    console.log('\n📁 Fichiers à uploader sur LWS :')
    console.log('- Tout le contenu du dossier "out/"')
    console.log('- Le fichier ".htaccess" (à créer)')
    
    console.log('\n🚀 Prochaines étapes :')
    console.log('1. Créer le fichier .htaccess')
    console.log('2. Uploader le dossier "out/" sur LWS')
    console.log('3. Configurer la base MySQL sur LWS')
    console.log('4. Déployer l\'API sur Vercel')

  } catch (error) {
    console.error('❌ Erreur lors du build:', error)
  }
}

// Exécuter le script
buildLWS()
