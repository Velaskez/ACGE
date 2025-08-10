import fs from 'fs'
import path from 'path'

async function setupPostgreSQLLocal() {
  try {
    console.log('🐘 Configuration de PostgreSQL local...')

    // Créer le fichier .env.local pour PostgreSQL local
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = `# Base de données PostgreSQL locale
# Assurez-vous que PostgreSQL est installé et en cours d'exécution
# Créez la base de données : createdb ged_database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ged_database"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-${Math.random().toString(36).substring(7)}"

# Environment
NODE_ENV="development"

# Configuration upload (optionnel)
UPLOAD_MAX_SIZE="10485760"  # 10MB
UPLOAD_DIR="./uploads"`

    fs.writeFileSync(envPath, envContent)
    console.log('✅ Fichier .env.local créé pour PostgreSQL local')

    console.log('\n🗄️ Instructions PostgreSQL local :')
    console.log('1. Assurez-vous que PostgreSQL est démarré')
    console.log('2. Créez la base de données : createdb ged_database')
    console.log('3. Ou utilisez pgAdmin/psql pour créer la DB')
    console.log('4. Modifiez le mot de passe dans .env.local si nécessaire')
    
    console.log('\n🔄 Étapes suivantes :')
    console.log('1. Générer le client Prisma : npm run db:generate')
    console.log('2. Créer les tables : npm run db:push')
    console.log('3. Créer un admin : npm run create-admin')
    console.log('4. Démarrer l\'app : npm run dev')

    console.log('\n💡 Alternative Docker :')
    console.log('Si vous voulez utiliser Docker, démarrez Docker Desktop et utilisez :')
    console.log('npm run setup:postgres && docker-compose up -d postgres')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  }
}

// Exécuter le script
setupPostgreSQLLocal()
