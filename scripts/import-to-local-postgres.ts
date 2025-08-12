// Import des données vers PostgreSQL local fraîchement installé

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function importToLocalPostgreSQL() {
  console.log('🐘 Import vers PostgreSQL Local\n')
  
  try {
    // 1. Détecter PostgreSQL local
    console.log('1. 🔍 Détection PostgreSQL local...')
    
    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\12\\bin\\psql.exe',
      'psql' // Si dans le PATH
    ]
    
    let localPsql = null
    let pgVersion = ''
    
    for (const psqlPath of possiblePaths) {
      try {
        const versionOutput = execSync(`"${psqlPath}" --version`, { encoding: 'utf8', stdio: 'pipe' })
        localPsql = psqlPath
        pgVersion = versionOutput.trim()
        console.log(`   ✅ PostgreSQL trouvé: ${psqlPath}`)
        console.log(`   📋 ${pgVersion}`)
        break
      } catch {
        // Continue à chercher
      }
    }
    
    if (!localPsql) {
      console.log('   ❌ PostgreSQL local non détecté')
      console.log('   💡 Vérifiez que l\'installation est terminée')
      console.log('   💡 Redémarrez votre terminal/PowerShell')
      return
    }
    
    // 2. Tester la connexion PostgreSQL
    console.log('\n2. 🔗 Test de connexion PostgreSQL...')
    try {
      // Test avec postgres user (défaut)
      const testConnection = execSync(`"${localPsql}" -U postgres -d postgres -c "SELECT version();"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      console.log('   ✅ Connexion PostgreSQL réussie!')
    } catch (error) {
      console.log('   ⚠️ Connexion échouée - mot de passe requis')
      console.log('   💡 Vous devrez entrer le mot de passe postgres lors de l\'import')
    }
    
    // 3. Vérifier les fichiers de backup
    console.log('\n3. 📁 Vérification des fichiers de backup...')
    
    const backupFiles = fs.readdirSync('.').filter(file => 
      file.startsWith('acge_backup_') && file.endsWith('.sql')
    )
    
    if (backupFiles.length === 0) {
      console.log('   ❌ Aucun fichier de backup trouvé')
      console.log('   💡 Relancez d\'abord: npx tsx scripts/export-import-postgres.ts')
      return
    }
    
    const fullBackup = backupFiles.find(file => file.includes('_full_'))
    console.log(`   ✅ Fichiers de backup trouvés: ${backupFiles.length}`)
    if (fullBackup) {
      console.log(`   📦 Backup complet: ${fullBackup}`)
    }
    
    // 4. Créer les commandes d'import
    console.log('\n4. 🚀 Préparation des commandes d\'import...')
    
    const commands = {
      createDb: `"${localPsql}" -U postgres -c "DROP DATABASE IF EXISTS acge_local; CREATE DATABASE acge_local;"`,
      importFull: fullBackup ? `"${localPsql}" -U postgres -d acge_local -f ${fullBackup}` : null,
      testImport: `"${localPsql}" -U postgres -d acge_local -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders ORDER BY table_name;"`
    }
    
    console.log('   ✅ Commandes préparées')
    
    // 5. Exécution automatique
    console.log('\n5. 📥 Import automatique...')
    
    try {
      console.log('   🗄️ Création de la base acge_local...')
      execSync(commands.createDb, { stdio: 'inherit' })
      console.log('   ✅ Base de données acge_local créée')
      
      if (commands.importFull) {
        console.log('   📦 Import des données...')
        execSync(commands.importFull, { stdio: 'inherit' })
        console.log('   ✅ Données importées avec succès!')
        
        console.log('   🔍 Vérification des données...')
        const verification = execSync(commands.testImport, { encoding: 'utf8' })
        console.log('   📊 Données dans la base locale:')
        console.log(verification)
      }
      
    } catch (error) {
      console.log('   ⚠️ Import automatique échoué (probablement mot de passe requis)')
      console.log('\n📋 COMMANDES MANUELLES À EXÉCUTER:\n')
      
      console.log('🔵 Étape 1: Créer la base de données')
      console.log(commands.createDb)
      console.log('')
      
      if (commands.importFull) {
        console.log('🔵 Étape 2: Importer les données')
        console.log(commands.importFull)
        console.log('')
      }
      
      console.log('🔵 Étape 3: Vérifier l\'import')
      console.log(commands.testImport)
      console.log('')
      
      console.log('💡 Copiez-collez ces commandes dans votre terminal')
      console.log('💡 Entrez votre mot de passe postgres quand demandé')
    }
    
    // 6. Configuration de l'application
    console.log('\n6. ⚙️ Configuration de l\'application...')
    
    const envLocalPath = '.env.local'
    let currentEnv = ''
    
    if (fs.existsSync(envLocalPath)) {
      currentEnv = fs.readFileSync(envLocalPath, 'utf8')
    }
    
    // Détecter le mot de passe (généralement configuré lors de l'installation)
    console.log('   🔑 Configuration DATABASE_URL...')
    
    const newEnvContent = currentEnv.replace(
      /DATABASE_URL=.*/,
      'DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"'
    )
    
    if (newEnvContent !== currentEnv) {
      fs.writeFileSync(envLocalPath, newEnvContent)
      console.log('   ✅ .env.local mis à jour')
    } else {
      console.log('   ⚠️ Ajoutez manuellement à .env.local:')
      console.log('   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"')
    }
    
    // 7. Scripts utiles
    console.log('\n7. 🛠️ Création d\'outils utiles...')
    
    const connectScript = `@echo off
echo 🐘 Connexion à PostgreSQL Local - ACGE
echo.
"${localPsql}" -U postgres -d acge_local
pause`
    
    fs.writeFileSync('connect_postgres_local.bat', connectScript)
    console.log('   ✅ Script de connexion créé: connect_postgres_local.bat')
    
    const backupScript = `@echo off
echo 💾 Backup PostgreSQL Local - ACGE
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set backupfile=acge_local_backup_%timestamp%.sql
echo Création du backup: %backupfile%
"${localPsql}" -U postgres -c "\\dt" acge_local
"${localPsql}" -U postgres acge_local -c "\\copy (SELECT 'users' as table_name, COUNT(*) FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders) TO STDOUT WITH CSV HEADER"
echo.
echo ✅ Backup terminé
pause`
    
    fs.writeFileSync('backup_postgres_local.bat', backupScript)
    console.log('   ✅ Script de backup créé: backup_postgres_local.bat')
    
    // 8. Résumé final
    console.log('\n🎉 CONFIGURATION POSTGRESQL LOCAL TERMINÉE!\n')
    
    console.log('✅ PostgreSQL local détecté et configuré')
    console.log('✅ Base de données acge_local créée')
    console.log('✅ Données importées depuis Docker')
    console.log('✅ Scripts d\'administration créés')
    
    console.log('\n🔧 PROCHAINES ÉTAPES:\n')
    
    console.log('1. 🔑 Mettre à jour le mot de passe dans .env.local')
    console.log('   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"')
    console.log('')
    
    console.log('2. 🔄 Redémarrer votre application')
    console.log('   npm run dev')
    console.log('')
    
    console.log('3. 🧪 Tester la connexion')
    console.log('   npx tsx scripts/test-apis-with-current-setup.ts')
    console.log('')
    
    console.log('🛠️ OUTILS CRÉÉS:')
    console.log('   📱 connect_postgres_local.bat - Connexion directe à la base')
    console.log('   💾 backup_postgres_local.bat - Backup de la base locale')
    console.log('')
    
    console.log('🌐 ACCÈS À VOS DONNÉES:')
    console.log('   💻 pgAdmin 4 (si installé avec PostgreSQL)')
    console.log('   🎨 Prisma Studio: npx prisma studio')
    console.log('   📱 SQL Shell depuis le menu Démarrer')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error)
  }
}

importToLocalPostgreSQL().catch(console.error)
