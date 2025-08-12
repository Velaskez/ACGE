// Script pour lancer Prisma Studio avec les bonnes variables d'environnement

import { execSync } from 'child_process'
import dotenv from 'dotenv'
import path from 'path'

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function launchPrismaStudio() {
  console.log('🚀 Lancement de Prisma Studio avec PostgreSQL Docker\n')
  
  // Vérifier les variables d'environnement
  console.log('🔍 Variables d\'environnement:')
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante'}`)
  console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Définie' : '❌ Manquante'}`)
  console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL ? '✅ Définie' : '❌ Manquante'}`)
  console.log('')
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL manquante!')
    console.log('💡 Configuration manuelle:')
    console.log('   $env:DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"')
    console.log('   npx prisma studio')
    return
  }
  
  console.log('🎯 Tentative de connexion à PostgreSQL Docker...')
  
  try {
    // Test de connexion basique
    execSync('npx prisma db pull', { 
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    })
    console.log('✅ Connexion réussie!')
    
    console.log('🚀 Lancement de Prisma Studio...')
    console.log('📱 URL: http://localhost:5555')
    console.log('💡 Fermez avec Ctrl+C quand terminé')
    
    // Lancer Prisma Studio
    execSync('npx prisma studio', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
    })
    
  } catch (error) {
    console.log('❌ Erreur:', error.message)
    console.log('\n🔧 Solutions possibles:')
    console.log('1. Vérifier Docker: docker ps')
    console.log('2. Redémarrer containers: docker-compose restart')
    console.log('3. Regénérer client: npx prisma generate')
    console.log('4. Lancement manuel:')
    console.log('   $env:DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"')
    console.log('   npx prisma studio')
  }
}

launchPrismaStudio().catch(console.error)
