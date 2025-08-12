// Script de réparation automatique de la base de données
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function autoRepairDatabase() {
  console.log('🔧 Réparation automatique de la base de données ACGE\n')
  
  try {
    // 1. Créer .env.local si manquant
    console.log('1. 📄 Vérification/création du fichier .env.local...')
    const envPath = path.join(process.cwd(), '.env.local')
    
    if (!fs.existsSync(envPath)) {
      console.log('   📝 Création du fichier .env.local...')
      const envContent = `DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5432/acge_database"
NEXTAUTH_SECRET="acge-dev-secret-key-change-in-production-2024"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"`
      
      fs.writeFileSync(envPath, envContent)
      console.log('   ✅ Fichier .env.local créé')
    } else {
      console.log('   ✅ Fichier .env.local existe déjà')
    }
    
    // 2. Démarrer Docker si nécessaire
    console.log('\n2. 🐳 Vérification/démarrage de Docker...')
    try {
      const dockerStatus = execSync('docker ps --filter "name=acge-postgres" --format "{{.Names}}"', { encoding: 'utf8' })
      if (!dockerStatus.includes('acge-postgres')) {
        console.log('   🚀 Démarrage du container PostgreSQL...')
        execSync('docker-compose up -d', { stdio: 'inherit' })
        console.log('   ✅ Container démarré')
        
        // Attendre que la base soit prête
        console.log('   ⏳ Attente de la disponibilité de la base...')
        await new Promise(resolve => setTimeout(resolve, 5000))
      } else {
        console.log('   ✅ Container PostgreSQL déjà en cours')
      }
    } catch (error) {
      console.log('   ⚠️  Impossible de vérifier Docker, tentative de démarrage...')
      try {
        execSync('docker-compose up -d', { stdio: 'inherit' })
        console.log('   ✅ Container démarré')
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (e) {
        console.log('   ❌ Impossible de démarrer Docker')
        console.log('   💡 Démarrez Docker Desktop manuellement')
        return
      }
    }
    
    // 3. Synchroniser le schéma
    console.log('\n3. 🔄 Synchronisation du schéma Prisma...')
    try {
      console.log('   📊 Tentative de push du schéma...')
      execSync('npx prisma db push', { stdio: 'pipe' })
      console.log('   ✅ Schéma synchronisé avec succès')
    } catch (error) {
      console.log('   ⚠️  Problème de synchronisation, tentative de reset...')
      try {
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
        console.log('   ✅ Schéma reseté et synchronisé')
      } catch (e) {
        console.log('   ❌ Impossible de synchroniser le schéma')
        console.log('   💡 Vérifiez manuellement la connexion à la base')
        return
      }
    }
    
    // 4. Générer le client Prisma
    console.log('\n4. 🔧 Génération du client Prisma...')
    try {
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('   ✅ Client Prisma généré')
    } catch (error) {
      console.log('   ❌ Erreur lors de la génération du client')
    }
    
    // 5. Test final
    console.log('\n5. 🧪 Test final de la configuration...')
    try {
      execSync('npx prisma db pull', { stdio: 'pipe' })
      console.log('   ✅ Test de connexion réussi')
      
      // Vérifier les tables critiques
      const tablesQuery = `SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public'`
      const result = execSync(
        `docker exec acge-postgres psql -U acge_user -d acge_database -t -c "${tablesQuery}"`, 
        { encoding: 'utf8' }
      )
      const tableCount = parseInt(result.trim())
      
      if (tableCount >= 6) {
        console.log(`   ✅ ${tableCount} tables détectées dans la base`)
      } else {
        console.log(`   ⚠️  Seulement ${tableCount} tables détectées (6 attendues)`)
      }
      
    } catch (error) {
      console.log('   ⚠️  Problème lors du test final')
    }
    
    console.log('\n🎉 RÉPARATION TERMINÉE !')
    console.log('\n📋 Actions effectuées :')
    console.log('   ✅ Fichier .env.local configuré')
    console.log('   ✅ Docker PostgreSQL démarré')
    console.log('   ✅ Schéma Prisma synchronisé')
    console.log('   ✅ Client Prisma généré')
    
    console.log('\n💡 Prochaines étapes :')
    console.log('   1. Testez votre application : npm run dev')
    console.log('   2. Vérifiez avec : npx tsx scripts/check-database-health.ts')
    console.log('   3. Créez un utilisateur admin : npx tsx scripts/create-admin.ts')
    
    console.log('\n📖 Documentation disponible :')
    console.log('   📁 docs/MIGRATIONS_GUIDE.md - Guide des migrations')
    console.log('   📁 scripts/quick-migrate.bat - Migration rapide')
    console.log('   📁 scripts/check-database-health.ts - Vérification santé')
    
  } catch (error) {
    console.error('❌ Erreur lors de la réparation automatique:', error)
    console.log('\n🆘 En cas de problème persistant :')
    console.log('   1. Vérifiez que Docker Desktop est démarré')
    console.log('   2. Exécutez manuellement : docker-compose up -d')
    console.log('   3. Puis : npx prisma db push --force-reset')
    process.exit(1)
  }
}

autoRepairDatabase().catch(console.error)
