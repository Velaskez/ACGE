import fs from 'fs'
import path from 'path'

async function setupPostgreSQL() {
  try {
    console.log('🐘 Configuration de PostgreSQL pour le développement...')

    // Créer le fichier .env.local pour PostgreSQL
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = `# Base de données PostgreSQL avec Docker
DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-${Math.random().toString(36).substring(7)}"

# Environment
NODE_ENV="development"

# Configuration upload (optionnel)
UPLOAD_MAX_SIZE="10485760"  # 10MB
UPLOAD_DIR="./uploads"`

    fs.writeFileSync(envPath, envContent)
    console.log('✅ Fichier .env.local créé avec PostgreSQL')

    console.log('\n🐳 Étapes suivantes :')
    console.log('1. Démarrer PostgreSQL : docker-compose up -d postgres')
    console.log('2. Générer le client Prisma : npm run db:generate')
    console.log('3. Créer les tables : npm run db:push')
    console.log('4. Créer un admin : npm run create-admin')
    console.log('5. Démarrer l\'app : npm run dev')

    console.log('\n📊 Accès pgAdmin (optionnel) :')
    console.log('URL: http://localhost:8080')
    console.log('Email: admin@acge.local')
    console.log('Password: admin123')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  }
}

// Exécuter le script
setupPostgreSQL()
