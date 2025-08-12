// Script pour créer automatiquement le fichier .env.local
import fs from 'fs'
import path from 'path'

async function setupEnvLocal() {
  console.log('🔧 Configuration du fichier .env.local\n')
  
  const envContent = `# Configuration ACGE - Environnement de développement
# Base de données PostgreSQL Docker
DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"

# NextAuth.js - Authentication
NEXTAUTH_SECRET="acge-dev-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"

# API publique
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Optionnel : Mode debug Prisma (décommentez si nécessaire)
# DEBUG="prisma:query"
`

  const envPath = path.join(process.cwd(), '.env.local')
  
  try {
    // Vérifier si le fichier existe déjà
    if (fs.existsSync(envPath)) {
      console.log('⚠️  Le fichier .env.local existe déjà')
      console.log('📋 Contenu actuel :')
      console.log(fs.readFileSync(envPath, 'utf8'))
      console.log('\n🔄 Mise à jour du fichier...')
    } else {
      console.log('📝 Création du fichier .env.local...')
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8')
    console.log('✅ Fichier .env.local créé avec succès !')
    console.log(`📍 Emplacement : ${envPath}`)
    
    console.log('\n📋 Variables configurées :')
    console.log('  ✅ DATABASE_URL (PostgreSQL Docker)')
    console.log('  ✅ NEXTAUTH_SECRET (Authentification)')
    console.log('  ✅ NEXTAUTH_URL (URL de développement)')
    console.log('  ✅ NEXT_PUBLIC_API_URL (API publique)')
    
    console.log('\n🔍 Test de la connexion à la base de données...')
    
    // Test rapide de la connexion
    const { execSync } = await import('child_process')
    try {
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: "postgresql://acge_user:acge_password_dev@localhost:5432/acge_database" }
      })
      console.log('✅ Connexion à la base de données OK !')
    } catch (error) {
      console.log('⚠️  Problème de connexion à la base de données')
      console.log('💡 Assurez-vous que Docker est démarré : docker-compose up -d')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du fichier .env.local:', error)
    process.exit(1)
  }
}

setupEnvLocal().catch(console.error)
