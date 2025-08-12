// Diagnostic et correction PostgreSQL Authentication

import { execSync } from 'child_process'

async function fixPostgreSQLAuth() {
  console.log('🔧 Diagnostic PostgreSQL Authentication\n')
  
  const psqlPath = '"C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe"'
  
  try {
    // 1. Vérifier le service PostgreSQL
    console.log('1. 🔍 Vérification du service PostgreSQL...')
    try {
      const serviceStatus = execSync('sc query postgresql-x64-17', { encoding: 'utf8' })
      if (serviceStatus.includes('RUNNING')) {
        console.log('   ✅ Service PostgreSQL en cours d\'exécution')
      } else {
        console.log('   ⚠️ Service PostgreSQL non démarré')
        console.log('   🔧 Tentative de démarrage...')
        execSync('net start postgresql-x64-17', { stdio: 'inherit' })
      }
    } catch (error) {
      console.log('   ❌ Problème avec le service PostgreSQL')
    }
    
    // 2. Tenter différentes méthodes d'authentification
    console.log('\n2. 🔑 Test de différentes méthodes d\'authentification...\n')
    
    const passwords = [
      'Reviti2025@',
      '',              // Pas de mot de passe
      'postgres',      // Mot de passe par défaut
      'admin',         // Autre possibilité
      'password'       // Autre possibilité
    ]
    
    let workingPassword = null
    
    for (const pwd of passwords) {
      try {
        console.log(`   🧪 Test avec mot de passe: "${pwd || '(vide)'}"`)
        
        process.env.PGPASSWORD = pwd
        const result = execSync(`${psqlPath} -U postgres -d postgres -c "SELECT 'OK' as status;"`, { 
          encoding: 'utf8',
          stdio: 'pipe'
        })
        
        workingPassword = pwd
        console.log(`   ✅ SUCCÈS avec le mot de passe: "${pwd || '(vide)'}"`)
        break
        
      } catch (error) {
        console.log(`   ❌ Échec avec: "${pwd || '(vide)'}"`)
      }
    }
    
    if (workingPassword !== null) {
      console.log(`\n🎉 Mot de passe fonctionnel trouvé: "${workingPassword || '(vide)'}"\n`)
      
      // Procéder à l'import avec le bon mot de passe
      console.log('3. 📦 Import des données avec le bon mot de passe...\n')
      
      process.env.PGPASSWORD = workingPassword
      
      try {
        // Créer la base
        console.log('   🗄️ Création de la base acge_local...')
        execSync(`${psqlPath} -U postgres -c "DROP DATABASE IF EXISTS acge_local;"`, { stdio: 'pipe' })
        execSync(`${psqlPath} -U postgres -c "CREATE DATABASE acge_local;"`, { stdio: 'pipe' })
        console.log('   ✅ Base créée')
        
        // Import des données
        console.log('   📦 Import des données...')
        const backupFile = 'acge_backup_full_2025-08-12T12-15-18.sql'
        execSync(`${psqlPath} -U postgres -d acge_local -f ${backupFile}`, { stdio: 'pipe' })
        console.log('   ✅ Données importées')
        
        // Vérification
        console.log('   🔍 Vérification...')
        const verification = execSync(`${psqlPath} -U postgres -d acge_local -c "SELECT COUNT(*) as total_users FROM users;"`, { encoding: 'utf8' })
        console.log(`   ✅ ${verification.trim()}`)
        
        // Configuration .env.local
        console.log('   ⚙️ Configuration .env.local...')
        const fs = require('fs')
        
        let envContent = ''
        if (fs.existsSync('.env.local')) {
          envContent = fs.readFileSync('.env.local', 'utf8')
        }
        
        const newDatabaseUrl = `DATABASE_URL="postgresql://postgres:${workingPassword}@localhost:5432/acge_local"`
        
        if (envContent.includes('DATABASE_URL=')) {
          envContent = envContent.replace(/DATABASE_URL=.*/, newDatabaseUrl)
        } else {
          envContent += '\n' + newDatabaseUrl + '\n'
        }
        
        fs.writeFileSync('.env.local', envContent)
        console.log('   ✅ .env.local configuré')
        
        // Mettre à jour Prisma
        console.log('   🔧 Configuration Prisma...')
        let prismaSchema = fs.readFileSync('prisma/schema.prisma', 'utf8')
        prismaSchema = prismaSchema.replace(/provider = "sqlite"/, 'provider = "postgresql"')
        fs.writeFileSync('prisma/schema.prisma', prismaSchema)
        console.log('   ✅ Schema Prisma mis à jour')
        
        console.log('\n🎉 POSTGRESQL LOCAL CONFIGURÉ AVEC SUCCÈS!\n')
        
        console.log('✅ RÉSULTATS:')
        console.log(`   🔑 Mot de passe PostgreSQL: "${workingPassword || '(vide)'}"`)
        console.log('   🗄️ Base acge_local créée et peuplée')
        console.log('   ⚙️ Application configurée pour PostgreSQL')
        console.log('   🔧 Prisma mis à jour pour PostgreSQL')
        
        console.log('\n🚀 PROCHAINES ÉTAPES:')
        console.log('   1. Redémarrer l\'application: npm run dev')
        console.log('   2. Tester: npx tsx scripts/test-apis-with-current-setup.ts')
        console.log('   3. Accès pgAdmin ou SQL Shell depuis le menu Démarrer')
        
        // Créer script de connexion
        const connectScript = `@echo off
echo 🐘 Connexion PostgreSQL Local - ACGE
set PGPASSWORD=${workingPassword}
${psqlPath} -U postgres -d acge_local
pause`
        
        fs.writeFileSync('connect_local_postgres.bat', connectScript)
        console.log('\n📱 Script créé: connect_local_postgres.bat')
        
      } catch (importError) {
        console.log('   ❌ Erreur lors de l\'import:', importError)
      }
      
    } else {
      console.log('\n❌ AUCUN MOT DE PASSE FONCTIONNEL TROUVÉ\n')
      
      console.log('💡 SOLUTIONS POSSIBLES:\n')
      
      console.log('🔵 Option 1: Réinitialiser le mot de passe PostgreSQL')
      console.log('   1. Arrêter le service: net stop postgresql-x64-17')
      console.log('   2. Modifier pg_hba.conf pour "trust"')
      console.log('   3. Redémarrer: net start postgresql-x64-17') 
      console.log('   4. Changer le mot de passe: ALTER USER postgres PASSWORD \'nouveau_mot_de_passe\';')
      console.log('')
      
      console.log('🔵 Option 2: Réinstaller PostgreSQL')
      console.log('   1. Désinstaller PostgreSQL complètement')
      console.log('   2. Réinstaller avec un mot de passe simple (ex: postgres)')
      console.log('   3. Relancer cet import')
      console.log('')
      
      console.log('🔵 Option 3: Utiliser un service cloud (Recommandé)')
      console.log('   1. Créer un compte Supabase (gratuit)')
      console.log('   2. Obtenir l\'URL de connexion')
      console.log('   3. Importer le backup via l\'interface web')
      console.log('')
      
      console.log('🔵 Option 4: Continuer avec Docker (Fonctionne déjà)')
      console.log('   1. Garder PostgreSQL Docker (pgAdmin: http://localhost:8080)')
      console.log('   2. Votre application fonctionne parfaitement avec Docker')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error)
  } finally {
    delete process.env.PGPASSWORD
  }
}

fixPostgreSQLAuth().catch(console.error)
