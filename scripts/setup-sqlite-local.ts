import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function setupSQLiteLocal() {
  try {
    console.log('🔧 Configuration de la base SQLite locale...')
    
    // Étape 1: Créer le fichier .env.local
    console.log('\n📝 Étape 1: Création du fichier .env.local...')
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
    
    const envPath = path.join(process.cwd(), '.env.local')
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Fichier .env.local créé')
    
    // Étape 2: Générer le client Prisma avec SQLite
    console.log('\n🔧 Étape 2: Génération du client Prisma (SQLite)...')
    execSync('npx prisma generate --schema=./prisma/schema.sqlite.prisma', { stdio: 'inherit' })
    console.log('✅ Client Prisma généré')
    
    // Étape 3: Créer la base de données SQLite
    console.log('\n🗄️ Étape 3: Création de la base de données SQLite...')
    execSync('npx prisma db push --schema=./prisma/schema.sqlite.prisma', { stdio: 'inherit' })
    console.log('✅ Base de données SQLite créée')
    
    // Étape 4: Créer un utilisateur admin
    console.log('\n👤 Étape 4: Création d\'un utilisateur admin...')
    execSync('npx tsx scripts/create-admin-sqlite.ts', { stdio: 'inherit' })
    console.log('✅ Utilisateur admin créé')
    
    console.log('\n🎉 Configuration SQLite locale terminée !')
    console.log('🚀 Vous pouvez maintenant lancer : npm run dev')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error)
  }
}

// Exécuter le script
setupSQLiteLocal()
