// Script pour localiser PostgreSQL après installation

import { execSync } from 'child_process'
import fs from 'fs'

async function findPostgreSQLInstallation() {
  console.log('🔍 Localisation de PostgreSQL...\n')
  
  // 1. Chercher dans les emplacements standards
  console.log('1. 📁 Recherche dans les répertoires standards...')
  
  const searchPaths = [
    'C:\\Program Files\\PostgreSQL',
    'C:\\Program Files (x86)\\PostgreSQL',
    'C:\\PostgreSQL'
  ]
  
  let foundInstallations = []
  
  for (const basePath of searchPaths) {
    try {
      if (fs.existsSync(basePath)) {
        console.log(`   ✅ Trouvé: ${basePath}`)
        const versions = fs.readdirSync(basePath)
        for (const version of versions) {
          const versionPath = `${basePath}\\${version}`
          const binPath = `${versionPath}\\bin`
          const psqlPath = `${binPath}\\psql.exe`
          
          if (fs.existsSync(psqlPath)) {
            foundInstallations.push({
              version,
              basePath: versionPath,
              binPath,
              psqlPath
            })
            console.log(`      📦 Version ${version} dans ${versionPath}`)
          }
        }
      }
    } catch (error) {
      // Ignore les erreurs d'accès
    }
  }
  
  // 2. Vérifier le PATH
  console.log('\n2. 🛤️ Vérification du PATH...')
  try {
    const psqlVersion = execSync('psql --version', { encoding: 'utf8', stdio: 'pipe' })
    console.log(`   ✅ psql trouvé dans le PATH: ${psqlVersion.trim()}`)
  } catch {
    console.log('   ❌ psql non trouvé dans le PATH')
  }
  
  // 3. Vérifier les services Windows
  console.log('\n3. 🔧 Vérification des services PostgreSQL...')
  try {
    const services = execSync('sc query type=service state=all | findstr /i "postgresql"', { 
      encoding: 'utf8', 
      stdio: 'pipe' 
    })
    console.log('   ✅ Services PostgreSQL détectés:')
    console.log(services)
  } catch {
    console.log('   ⚠️ Aucun service PostgreSQL détecté ou en cours')
  }
  
  // 4. Recommandations
  console.log('\n🎯 RÉSULTATS:\n')
  
  if (foundInstallations.length > 0) {
    console.log('✅ PostgreSQL installé avec succès!')
    console.log('📦 Installations trouvées:')
    
    for (const install of foundInstallations) {
      console.log(`   🐘 PostgreSQL ${install.version}`)
      console.log(`      📁 Répertoire: ${install.basePath}`)
      console.log(`      💻 psql: ${install.psqlPath}`)
      console.log('')
    }
    
    // Utiliser la version la plus récente
    const latestInstall = foundInstallations[foundInstallations.length - 1]
    console.log(`🚀 COMMANDES POUR CONTINUER:\n`)
    
    console.log('📋 Test de connexion:')
    console.log(`"${latestInstall.psqlPath}" -U postgres -d postgres -c "SELECT version();"`)
    console.log('')
    
    console.log('📋 Création de la base acge_local:')
    console.log(`"${latestInstall.psqlPath}" -U postgres -c "CREATE DATABASE acge_local;"`)
    console.log('')
    
    console.log('📋 Import des données:')
    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('acge_backup_full_'))
    if (backupFiles.length > 0) {
      console.log(`"${latestInstall.psqlPath}" -U postgres -d acge_local -f ${backupFiles[0]}`)
    }
    console.log('')
    
    // Créer un script batch pour faciliter l'usage
    const batchScript = `@echo off
echo 🐘 Configuration PostgreSQL Local pour ACGE
echo.

echo 📋 Étape 1: Test de connexion...
"${latestInstall.psqlPath}" -U postgres -d postgres -c "SELECT 'PostgreSQL connecté!' as status;"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur de connexion - vérifiez votre mot de passe
    pause
    exit /b 1
)

echo.
echo 📋 Étape 2: Création de la base acge_local...
"${latestInstall.psqlPath}" -U postgres -c "DROP DATABASE IF EXISTS acge_local;"
"${latestInstall.psqlPath}" -U postgres -c "CREATE DATABASE acge_local;"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de la création de la base
    pause
    exit /b 1
)

echo.
echo 📋 Étape 3: Import des données...
${backupFiles.length > 0 ? `"${latestInstall.psqlPath}" -U postgres -d acge_local -f ${backupFiles[0]}` : 'REM Aucun fichier de backup trouvé'}
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de l'import
    pause
    exit /b 1
)

echo.
echo 📋 Étape 4: Vérification...
"${latestInstall.psqlPath}" -U postgres -d acge_local -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders ORDER BY table_name;"

echo.
echo 🎉 Configuration terminée avec succès!
echo.
echo 💡 Prochaines étapes:
echo 1. Modifier .env.local avec: DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"
echo 2. Redémarrer votre application: npm run dev
echo.
pause
`
    
    fs.writeFileSync('setup_postgres_local_auto.bat', batchScript)
    console.log('🚀 Script automatique créé: setup_postgres_local_auto.bat')
    console.log('💻 Double-cliquez sur ce fichier pour configurer automatiquement!')
    
  } else {
    console.log('❌ PostgreSQL non trouvé')
    console.log('\n💡 SOLUTIONS POSSIBLES:')
    console.log('1. 🔄 Redémarrez votre terminal/PowerShell')
    console.log('2. 🔄 Redémarrez votre ordinateur')
    console.log('3. 📥 Réinstallez PostgreSQL avec les options par défaut')
    console.log('4. ✅ Vérifiez que l\'installation s\'est bien terminée')
    console.log('')
    console.log('🌐 Lien de téléchargement: https://www.postgresql.org/download/windows/')
  }
  
  console.log('\n🔧 ÉTAPES SUIVANTES:')
  console.log('1. Si PostgreSQL est trouvé: Exécutez setup_postgres_local_auto.bat')
  console.log('2. Si PostgreSQL n\'est pas trouvé: Redémarrez le terminal et relancez ce script')
  console.log('3. Entrez votre mot de passe postgres quand demandé')
}

findPostgreSQLInstallation().catch(console.error)
