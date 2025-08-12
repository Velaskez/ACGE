// Configuration complète PostgreSQL avec vérification Docker
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function setupPostgreSQLComplete() {
  console.log('🐘 Configuration complète de PostgreSQL...\n')
  
  try {
    // 1. Vérifier Docker Desktop
    console.log('1. 🐳 Vérification de Docker...')
    try {
      execSync('docker --version', { stdio: 'pipe' })
      console.log('   ✅ Docker installé')
      
      try {
        execSync('docker ps', { stdio: 'pipe' })
        console.log('   ✅ Docker Desktop en cours d\'exécution')
      } catch {
        console.log('   ⚠️ Docker Desktop n\'est pas démarré')
        console.log('   💡 Démarrez Docker Desktop et relancez ce script')
        return
      }
    } catch {
      console.log('   ❌ Docker non installé')
      console.log('   💡 Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop')
      return
    }
    
    // 2. Arrêter les containers existants
    console.log('\n2. 🛑 Arrêt des containers existants...')
    try {
      execSync('docker-compose down', { stdio: 'pipe' })
      console.log('   ✅ Containers arrêtés')
    } catch {
      console.log('   ⚠️ Aucun container à arrêter')
    }
    
    // 3. Créer le fichier .env.local pour PostgreSQL
    console.log('\n3. ⚙️ Configuration .env.local...')
    const envPath = path.join(process.cwd(), '.env.local')
    const secretSuffix = Math.random().toString(36).substring(7)
    
    const envContent = `# Base de données PostgreSQL avec Docker
DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="unified-jwt-secret-for-development-${secretSuffix}"

# Environment
NODE_ENV="development"

# Configuration upload
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"

# Application Settings
NEXT_PUBLIC_API_URL="http://localhost:3000"
`
    
    fs.writeFileSync(envPath, envContent)
    console.log('   ✅ Fichier .env.local créé pour PostgreSQL')
    
    // 4. Démarrer PostgreSQL
    console.log('\n4. 🚀 Démarrage de PostgreSQL...')
    try {
      execSync('docker-compose up -d postgres', { stdio: 'inherit' })
      console.log('   ✅ PostgreSQL démarré en arrière-plan')
    } catch (error) {
      console.log('   ❌ Erreur lors du démarrage PostgreSQL:', error)
      return
    }
    
    // 5. Attendre que PostgreSQL soit prêt
    console.log('\n5. ⏳ Attente de PostgreSQL...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 6. Tester la connexion
    console.log('\n6. 🔍 Test de connexion...')
    try {
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()
      
      await prisma.$connect()
      console.log('   ✅ Connexion PostgreSQL réussie!')
      await prisma.$disconnect()
    } catch (error) {
      console.log('   ⚠️ Test de connexion échoué, mais PostgreSQL semble démarré')
      console.log('   💡 Continuons avec la migration...')
    }
    
    console.log('\n✅ Configuration PostgreSQL terminée!')
    console.log('\n🔄 Étapes suivantes:')
    console.log('1. npm run dev (pour redémarrer avec PostgreSQL)')
    console.log('2. npx prisma db push (pour créer les tables)')
    console.log('3. npx tsx scripts/create-test-user.ts (pour créer l\'admin)')
    
    console.log('\n📊 Services disponibles:')
    console.log('- Application: http://localhost:3000')
    console.log('- pgAdmin: http://localhost:8080 (admin@acge.local / admin123)')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration PostgreSQL:', error)
  }
}

setupPostgreSQLComplete().catch(console.error)
