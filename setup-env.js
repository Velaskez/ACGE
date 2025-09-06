const fs = require('fs')
const path = require('path')

console.log('🔧 Configuration de l\'environnement...')

const envContent = `# Configuration Supabase de test
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth pour développement local
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"

# URL de base pour les API locales
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Configuration upload locale
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"
`

const envPath = path.join(process.cwd(), '.env.local')

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env.local créé')
  console.log('⚠️  Vous devez configurer les vraies clés Supabase')
} catch (error) {
  console.error('❌ Erreur création .env.local:', error)
}
