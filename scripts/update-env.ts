import fs from 'fs'
import path from 'path'

async function updateEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envContent = `# Base de données PostgreSQL locale avec le bon mot de passe
DATABASE_URL="postgresql://postgres:Reviti2025@localhost:5432/ged_database"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-${Math.random().toString(36).substring(7)}"

# Environment
NODE_ENV="development"

# Configuration upload (optionnel)
UPLOAD_MAX_SIZE="10485760"  # 10MB
UPLOAD_DIR="./uploads"`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env.local mis à jour avec le bon mot de passe PostgreSQL')
  console.log('📝 Note: Le "@" est encodé en "%40" dans l\'URL de connexion')
}

updateEnv()
