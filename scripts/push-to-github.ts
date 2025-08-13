import { execSync } from 'child_process'

async function pushToGitHub() {
  try {
    console.log('🚀 Push vers GitHub...')

    // Vérifier le statut
    console.log('📋 Statut Git :')
    execSync('git status', { stdio: 'inherit' })

    // Ajouter tous les fichiers
    console.log('\n📦 Ajout des fichiers...')
    execSync('git add .', { stdio: 'inherit' })

    // Commit
    console.log('\n💾 Commit des modifications...')
    execSync('git commit -m "Deploy ACGE application to LWS - Static export ready"', { stdio: 'inherit' })

    // Push
    console.log('\n📤 Push vers GitHub...')
    execSync('git push origin main', { stdio: 'inherit' })

    console.log('\n✅ Push terminé avec succès !')
    console.log('🌐 Le déploiement automatique devrait se déclencher sur Vercel')

  } catch (error) {
    console.error('❌ Erreur lors du push:', error)
  }
}

// Exécuter le script
pushToGitHub()
