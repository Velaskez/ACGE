import fs from 'fs'
import path from 'path'

console.log('🔧 Configuration SQLite pour tests locaux...')

const envContent = `# Base de données SQLite locale pour les tests
DATABASE_URL="file:./prisma/dev.db"

# NextAuth pour développement local
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"

# URL de base pour les API locales
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Configuration upload locale
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"
`

const envPath = path.join(process.cwd(), '.env')

try {
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env configuré pour SQLite local')
  console.log('📁 Chemin :', envPath)
  console.log('🔗 DATABASE_URL : file:./prisma/dev.db')
  
  console.log('\n📋 Prochaines étapes :')
  console.log('1. Exécutez : npx prisma db push')
  console.log('2. Exécutez : npx tsx scripts/create-admin-simple.ts')
  console.log('3. Testez la connexion sur http://localhost:3000')
  
} catch (error) {
  console.error('❌ Erreur lors de la configuration :', error)
}
