// Export/Import PostgreSQL Docker vers Local - Option 1

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function exportImportPostgreSQL() {
  console.log('🔄 Export/Import PostgreSQL Docker → Local\n')
  
  try {
    // 1. Vérifier que PostgreSQL Docker est disponible
    console.log('1. 🐳 Vérification PostgreSQL Docker...')
    try {
      execSync('docker exec acge-postgres pg_isready -U acge_user -d acge_database', { stdio: 'pipe' })
      console.log('   ✅ PostgreSQL Docker opérationnel')
    } catch {
      console.log('   ❌ PostgreSQL Docker non disponible')
      console.log('   💡 Démarrez avec: docker-compose up -d postgres')
      return
    }
    
    // 2. Export depuis Docker
    console.log('\n2. 📤 Export des données depuis Docker...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const backupFiles = {
      full: `acge_backup_full_${timestamp}.sql`,
      schema: `acge_backup_schema_${timestamp}.sql`,
      data: `acge_backup_data_${timestamp}.sql`
    }
    
    try {
      // Export complet (schéma + données)
      console.log('   📦 Export complet (schéma + données)...')
      execSync(`docker exec acge-postgres pg_dump -U acge_user acge_database > ${backupFiles.full}`, { stdio: 'inherit' })
      console.log(`   ✅ Backup complet créé: ${backupFiles.full}`)
      
      // Export schéma seulement
      console.log('   🏗️ Export schéma uniquement...')
      execSync(`docker exec acge-postgres pg_dump -U acge_user -s acge_database > ${backupFiles.schema}`, { stdio: 'inherit' })
      console.log(`   ✅ Backup schéma créé: ${backupFiles.schema}`)
      
      // Export données seulement
      console.log('   📊 Export données uniquement...')
      execSync(`docker exec acge-postgres pg_dump -U acge_user -a acge_database > ${backupFiles.data}`, { stdio: 'inherit' })
      console.log(`   ✅ Backup données créé: ${backupFiles.data}`)
      
    } catch (error) {
      console.log('   ❌ Erreur lors de l\'export:', error)
      return
    }
    
    // 3. Vérifier les fichiers créés
    console.log('\n3. 📋 Vérification des fichiers exportés...')
    for (const [type, filename] of Object.entries(backupFiles)) {
      if (fs.existsSync(filename)) {
        const stats = fs.statSync(filename)
        console.log(`   ✅ ${type.padEnd(8)}: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`)
      } else {
        console.log(`   ❌ ${type.padEnd(8)}: ${filename} - Non trouvé`)
      }
    }
    
    // 4. Détecter PostgreSQL local
    console.log('\n4. 🔍 Détection PostgreSQL local...')
    
    const possiblePaths = [
      'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe',
      'C:\\Program Files\\PostgreSQL\\12\\bin\\psql.exe',
      'psql' // Si dans le PATH
    ]
    
    let localPsql = null
    for (const psqlPath of possiblePaths) {
      try {
        const versionOutput = execSync(`"${psqlPath}" --version`, { encoding: 'utf8', stdio: 'pipe' })
        localPsql = psqlPath
        console.log(`   ✅ PostgreSQL local trouvé: ${psqlPath}`)
        console.log(`   📋 Version: ${versionOutput.trim()}`)
        break
      } catch {
        // Continue à chercher
      }
    }
    
    if (!localPsql) {
      console.log('   ❌ PostgreSQL local non trouvé')
      console.log('\n💡 SOLUTIONS:')
      console.log('   1. Installer PostgreSQL: https://www.postgresql.org/download/windows/')
      console.log('   2. Utiliser un service cloud (Supabase, Neon)')
      console.log('   3. Importer sur un autre serveur PostgreSQL')
      console.log('\n📁 Fichiers de backup créés et prêts à utiliser:')
      Object.values(backupFiles).forEach(file => console.log(`      ${file}`))
      return
    }
    
    // 5. Instructions d'import
    console.log('\n5. 📥 Instructions d\'import vers PostgreSQL local:\n')
    
    console.log('🔵 ÉTAPE A: Créer une base de données locale')
    console.log(`   "${localPsql}" -U postgres -c "CREATE DATABASE acge_local;"`)
    console.log('')
    
    console.log('🔵 ÉTAPE B: Importer les données (choisissez une option)')
    console.log(`   # Option 1: Import complet (recommandé)`)
    console.log(`   "${localPsql}" -U postgres -d acge_local -f ${backupFiles.full}`)
    console.log('')
    console.log(`   # Option 2: Import schéma puis données`)
    console.log(`   "${localPsql}" -U postgres -d acge_local -f ${backupFiles.schema}`)
    console.log(`   "${localPsql}" -U postgres -d acge_local -f ${backupFiles.data}`)
    console.log('')
    
    console.log('🔵 ÉTAPE C: Configurer votre application')
    console.log('   Modifier .env.local avec:')
    console.log('   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"')
    console.log('')
    
    // 6. Script d'import automatique
    console.log('6. 🚀 Script d\'import automatique créé...')
    
    const importScript = `
@echo off
echo 🔄 Import automatique PostgreSQL Docker vers Local
echo.

echo 📋 Étape 1: Création de la base locale...
"${localPsql}" -U postgres -c "DROP DATABASE IF EXISTS acge_local;"
"${localPsql}" -U postgres -c "CREATE DATABASE acge_local;"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de la création de la base
    pause
    exit /b 1
)
echo ✅ Base acge_local créée

echo.
echo 📋 Étape 2: Import des données...
"${localPsql}" -U postgres -d acge_local -f ${backupFiles.full}
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de l'import
    pause
    exit /b 1
)
echo ✅ Données importées avec succès

echo.
echo 📋 Étape 3: Vérification...
"${localPsql}" -U postgres -d acge_local -c "SELECT 'users' as table_name, COUNT(*) FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders;"

echo.
echo 🎉 Import terminé avec succès!
echo 💡 N'oubliez pas de modifier DATABASE_URL dans .env.local
echo DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"
pause
`
    
    const scriptPath = 'import_postgres_local.bat'
    fs.writeFileSync(scriptPath, importScript)
    console.log(`   ✅ Script créé: ${scriptPath}`)
    console.log('   💻 Exécutez ce script pour import automatique')
    
    console.log('\n🎯 RÉSUMÉ:')
    console.log('✅ Export depuis Docker: Terminé')
    console.log('✅ Fichiers de backup: Créés')
    console.log('✅ PostgreSQL local: Détecté')
    console.log('✅ Script d\'import: Prêt')
    console.log('')
    console.log('▶️ PROCHAINES ÉTAPES:')
    console.log('1. Exécutez le script: import_postgres_local.bat')
    console.log('2. Ou suivez les instructions manuelles ci-dessus')
    console.log('3. Modifiez .env.local avec la nouvelle URL')
    console.log('4. Redémarrez votre application')
    
  } catch (error) {
    console.error('❌ Erreur lors du processus export/import:', error)
  }
}

exportImportPostgreSQL().catch(console.error)
