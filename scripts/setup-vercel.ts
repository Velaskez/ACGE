import fs from 'fs'
import path from 'path'

async function setupVercel() {
  try {
    console.log('🚀 Configuration pour Vercel API...')

    // Créer le fichier .env.production pour Vercel
    const envPath = path.join(process.cwd(), '.env.vercel')
    const envContent = `# Base de données MySQL LWS
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"

# Configuration NextAuth pour Vercel
NEXTAUTH_URL="https://acge-api.vercel.app"
NEXTAUTH_SECRET="vercel-secret-key-${Math.random().toString(36).substring(7)}"

# API URL (Vercel)
NEXT_PUBLIC_API_URL="https://acge-api.vercel.app"

# Environment
NODE_ENV="production"

# Configuration upload (Vercel Blob ou stockage local)
UPLOAD_MAX_SIZE="10485760"  # 10MB
UPLOAD_DIR="./uploads"`

    fs.writeFileSync(envPath, envContent)
    console.log('✅ Fichier .env.vercel créé pour Vercel')

    console.log('\n📋 Instructions pour Vercel :')
    console.log('1. Allez sur https://vercel.com')
    console.log('2. Connectez-vous avec GitHub')
    console.log('3. Importez votre repository ACGE-app')
    console.log('4. Configurez les variables d\'environnement :')
    console.log('   - DATABASE_URL: mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579')
    console.log('   - NEXTAUTH_SECRET: [généré automatiquement]')
    console.log('   - NEXTAUTH_URL: https://acge-api.vercel.app')

    console.log('\n🔧 Étapes suivantes :')
    console.log('1. Déployer sur Vercel')
    console.log('2. Configurer les variables d\'environnement')
    console.log('3. Tester l\'API')
    console.log('4. Connecter le frontend LWS à l\'API Vercel')

    console.log('\n🌍 Configuration finale :')
    console.log('- Frontend : acge-gabon.com (LWS)')
    console.log('- Backend : acge-api.vercel.app (Vercel)')
    console.log('- Base : MySQL (LWS)')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  }
}

// Exécuter le script
setupVercel()
