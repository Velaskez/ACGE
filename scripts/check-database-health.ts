// Script de vérification de la santé de la base de données
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface HealthCheck {
  name: string
  status: 'OK' | 'WARNING' | 'ERROR'
  message: string
  suggestion?: string
}

async function checkDatabaseHealth() {
  console.log('🏥 Vérification de la santé de la base de données ACGE\n')
  
  const checks: HealthCheck[] = []
  
  try {
    // 1. Vérifier le fichier .env.local
    console.log('1. 📄 Vérification du fichier .env.local...')
    const envPath = path.join(process.cwd(), '.env.local')
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      if (envContent.includes('DATABASE_URL')) {
        checks.push({
          name: 'Fichier .env.local',
          status: 'OK',
          message: 'Fichier de configuration présent et configuré'
        })
      } else {
        checks.push({
          name: 'Fichier .env.local',
          status: 'WARNING',
          message: 'DATABASE_URL manquante',
          suggestion: 'Exécutez: npx tsx scripts/setup-env-local.ts'
        })
      }
    } else {
      checks.push({
        name: 'Fichier .env.local',
        status: 'ERROR',
        message: 'Fichier .env.local manquant',
        suggestion: 'Exécutez: npx tsx scripts/setup-env-local.ts'
      })
    }
    
    // 2. Vérifier Docker
    console.log('2. 🐳 Vérification de Docker...')
    try {
      const dockerStatus = execSync('docker ps --filter "name=acge-postgres" --format "table {{.Names}}\\t{{.Status}}"', { encoding: 'utf8' })
      if (dockerStatus.includes('acge-postgres')) {
        checks.push({
          name: 'Container PostgreSQL',
          status: 'OK',
          message: 'Container acge-postgres en cours d\'exécution'
        })
      } else {
        checks.push({
          name: 'Container PostgreSQL',
          status: 'ERROR',
          message: 'Container acge-postgres non démarré',
          suggestion: 'Exécutez: docker-compose up -d'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Docker',
        status: 'ERROR',
        message: 'Docker n\'est pas accessible',
        suggestion: 'Démarrez Docker Desktop'
      })
    }
    
    // 3. Vérifier la connexion Prisma
    console.log('3. 🔗 Vérification de la connexion Prisma...')
    try {
      execSync('npx prisma db pull', { stdio: 'pipe' })
      checks.push({
        name: 'Connexion Prisma',
        status: 'OK',
        message: 'Connexion à la base de données réussie'
      })
    } catch (error) {
      checks.push({
        name: 'Connexion Prisma',
        status: 'ERROR',
        message: 'Impossible de se connecter à la base de données',
        suggestion: 'Vérifiez que Docker est démarré et que .env.local est correct'
      })
    }
    
    // 4. Vérifier la synchronisation du schéma
    console.log('4. 🔄 Vérification de la synchronisation du schéma...')
    try {
      const statusOutput = execSync('npx prisma migrate status', { encoding: 'utf8', stdio: 'pipe' })
      if (statusOutput.includes('Database is up to date')) {
        checks.push({
          name: 'Synchronisation schéma',
          status: 'OK',
          message: 'Base de données synchronisée avec le schéma Prisma'
        })
      } else {
        checks.push({
          name: 'Synchronisation schéma',
          status: 'WARNING',
          message: 'Le schéma n\'est pas à jour',
          suggestion: 'Exécutez: npx prisma migrate dev ou npx prisma db push'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Synchronisation schéma',
        status: 'WARNING',
        message: 'Impossible de vérifier le statut des migrations',
        suggestion: 'Exécutez: npx prisma db push pour forcer la synchronisation'
      })
    }
    
    // 5. Vérifier les tables critiques
    console.log('5. 📊 Vérification des tables critiques...')
    try {
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public' 
        ORDER BY table_name
      `
      const tablesOutput = execSync(
        `docker exec acge-postgres psql -U acge_user -d acge_database -t -c "${tablesQuery}"`, 
        { encoding: 'utf8' }
      )
      
      const requiredTables = ['users', 'documents', 'folders', 'comments', 'tags', 'document_versions']
      const existingTables = tablesOutput.split('\n').map(line => line.trim()).filter(Boolean)
      
      const missingTables = requiredTables.filter(table => !existingTables.includes(table))
      
      if (missingTables.length === 0) {
        checks.push({
          name: 'Tables critiques',
          status: 'OK',
          message: `Toutes les tables sont présentes (${existingTables.length} tables)`
        })
      } else {
        checks.push({
          name: 'Tables critiques',
          status: 'ERROR',
          message: `Tables manquantes: ${missingTables.join(', ')}`,
          suggestion: 'Exécutez: npx prisma db push --force-reset'
        })
      }
    } catch (error) {
      checks.push({
        name: 'Tables critiques',
        status: 'ERROR',
        message: 'Impossible de vérifier les tables',
        suggestion: 'Vérifiez la connexion à PostgreSQL'
      })
    }
    
    // 6. Vérifier Prisma Client
    console.log('6. 🔧 Vérification du client Prisma...')
    const clientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client')
    if (fs.existsSync(clientPath)) {
      checks.push({
        name: 'Client Prisma',
        status: 'OK',
        message: 'Client Prisma généré et disponible'
      })
    } else {
      checks.push({
        name: 'Client Prisma',
        status: 'WARNING',
        message: 'Client Prisma non généré',
        suggestion: 'Exécutez: npx prisma generate'
      })
    }
    
    // Affichage des résultats
    console.log('\n📋 RAPPORT DE SANTÉ\n')
    
    let okCount = 0
    let warningCount = 0
    let errorCount = 0
    
    checks.forEach(check => {
      const icon = check.status === 'OK' ? '✅' : check.status === 'WARNING' ? '⚠️' : '❌'
      console.log(`${icon} ${check.name}: ${check.message}`)
      if (check.suggestion) {
        console.log(`   💡 ${check.suggestion}`)
      }
      console.log('')
      
      if (check.status === 'OK') okCount++
      else if (check.status === 'WARNING') warningCount++
      else errorCount++
    })
    
    // Résumé
    console.log('📊 RÉSUMÉ:')
    console.log(`   ✅ OK: ${okCount}`)
    console.log(`   ⚠️  Avertissements: ${warningCount}`)
    console.log(`   ❌ Erreurs: ${errorCount}`)
    
    if (errorCount === 0 && warningCount === 0) {
      console.log('\n🎉 Parfait ! Votre base de données est en excellente santé !')
    } else if (errorCount === 0) {
      console.log('\n👍 Bon état général, quelques points à améliorer.')
    } else {
      console.log('\n⚠️  Attention : des problèmes critiques ont été détectés.')
      console.log('Suivez les suggestions ci-dessus pour les résoudre.')
    }
    
    // Script de réparation automatique
    if (errorCount > 0 || warningCount > 0) {
      console.log('\n🔧 RÉPARATION AUTOMATIQUE DISPONIBLE')
      console.log('Pour tenter une réparation automatique, exécutez :')
      console.log('npx tsx scripts/auto-repair-database.ts')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    process.exit(1)
  }
}

checkDatabaseHealth().catch(console.error)
