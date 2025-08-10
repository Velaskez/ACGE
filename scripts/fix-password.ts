import fs from 'fs'
import path from 'path'

async function fixPassword() {
  const envPath = path.join(process.cwd(), '.env')
  
  // Utiliser le mot de passe simplifié
  const envContent = `# Base de données PostgreSQL locale
DATABASE_URL="postgresql://postgres:Reviti2025@localhost:5432/ged_database"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-change-in-production-${Math.random().toString(36).substring(7)}"

# Environment
NODE_ENV="development"

# Configuration upload
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"`

  fs.writeFileSync(envPath, envContent)
  console.log('✅ Fichier .env mis à jour avec le mot de passe simplifié: Reviti2025')
}

fixPassword()
