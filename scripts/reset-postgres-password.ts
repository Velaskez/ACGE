// Guide de réinitialisation du mot de passe PostgreSQL

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function resetPostgreSQLPassword() {
  console.log('🔐 Réinitialisation du mot de passe PostgreSQL\n')
  
  const pgVersion = '17'
  const pgDataPath = `C:\\Program Files\\PostgreSQL\\${pgVersion}\\data`
  const pgHbaPath = `${pgDataPath}\\pg_hba.conf`
  const pgHbaBackup = `${pgDataPath}\\pg_hba.conf.backup`
  
  console.log('🎯 MÉTHODE RECOMMANDÉE: Modification temporaire de pg_hba.conf\n')
  
  console.log('📋 ÉTAPES À SUIVRE:\n')
  
  console.log('🔵 ÉTAPE 1: Arrêter PostgreSQL')
  console.log('   Ouvrez PowerShell en tant qu\'ADMINISTRATEUR et exécutez:')
  console.log('   net stop postgresql-x64-17')
  console.log('')
  
  console.log('🔵 ÉTAPE 2: Modifier pg_hba.conf')
  console.log(`   1. Aller dans: ${pgDataPath}`)
  console.log('   2. Faire une copie de pg_hba.conf → pg_hba.conf.backup')
  console.log('   3. Ouvrir pg_hba.conf avec un éditeur de texte (Notepad++)')
  console.log('   4. Trouver cette ligne:')
  console.log('      host    all             all             127.0.0.1/32            scram-sha-256')
  console.log('   5. La remplacer par:')
  console.log('      host    all             all             127.0.0.1/32            trust')
  console.log('   6. Sauvegarder le fichier')
  console.log('')
  
  console.log('🔵 ÉTAPE 3: Redémarrer PostgreSQL')
  console.log('   Dans PowerShell ADMINISTRATEUR:')
  console.log('   net start postgresql-x64-17')
  console.log('')
  
  console.log('🔵 ÉTAPE 4: Changer le mot de passe')
  console.log('   Maintenant PostgreSQL accepte les connexions sans mot de passe:')
  console.log(`   "${path.join('C:', 'Program Files', 'PostgreSQL', pgVersion, 'bin', 'psql.exe')}" -U postgres -d postgres`)
  console.log('   Puis exécuter:')
  console.log('   ALTER USER postgres PASSWORD \'nouveau_mot_de_passe\';')
  console.log('   \\q')
  console.log('')
  
  console.log('🔵 ÉTAPE 5: Restaurer la sécurité')
  console.log('   1. Arrêter PostgreSQL: net stop postgresql-x64-17')
  console.log('   2. Restaurer pg_hba.conf depuis pg_hba.conf.backup')
  console.log('   3. Redémarrer: net start postgresql-x64-17')
  console.log('')
  
  console.log('🚀 ALTERNATIVE RAPIDE:\n')
  
  // Créer un script automatique
  const resetScript = `@echo off
echo 🔐 Réinitialisation mot de passe PostgreSQL
echo.
echo ⚠️ ATTENTION: Ce script doit être exécuté en tant qu'ADMINISTRATEUR
echo.
echo 📋 Étape 1: Arrêt de PostgreSQL...
net stop postgresql-x64-17
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur: Vous devez exécuter ce script en tant qu'ADMINISTRATEUR
    echo 💡 Clic droit → "Exécuter en tant qu'administrateur"
    pause
    exit /b 1
)

echo.
echo 📋 Étape 2: Modification temporaire de pg_hba.conf...
cd /d "${pgDataPath}"
copy pg_hba.conf pg_hba.conf.backup > nul
powershell -Command "(Get-Content 'pg_hba.conf') -replace 'scram-sha-256', 'trust' | Set-Content 'pg_hba.conf'"

echo.
echo 📋 Étape 3: Redémarrage de PostgreSQL...
net start postgresql-x64-17

echo.
echo 📋 Étape 4: Changement du mot de passe...
echo Entrez votre nouveau mot de passe quand demandé:
set /p newpassword="Nouveau mot de passe: "

"C:\\Program Files\\PostgreSQL\\${pgVersion}\\bin\\psql.exe" -U postgres -d postgres -c "ALTER USER postgres PASSWORD '%newpassword%';"

echo.
echo 📋 Étape 5: Restauration de la sécurité...
net stop postgresql-x64-17
copy pg_hba.conf.backup pg_hba.conf > nul
net start postgresql-x64-17

echo.
echo 🎉 Mot de passe réinitialisé avec succès!
echo 🔑 Nouveau mot de passe: %newpassword%
echo.
echo 📋 Testez la connexion:
echo "C:\\Program Files\\PostgreSQL\\${pgVersion}\\bin\\psql.exe" -U postgres -d postgres
echo.
pause`

  fs.writeFileSync('reset_postgres_password.bat', resetScript)
  console.log('📁 Script automatique créé: reset_postgres_password.bat')
  console.log('⚠️ IMPORTANT: Clic droit → "Exécuter en tant qu\'administrateur"')
  console.log('')
  
  console.log('🎯 ALTERNATIVE SIMPLE:\n')
  
  console.log('🔵 Option 1: Utiliser pgAdmin')
  console.log('   1. Chercher "pgAdmin" dans le menu Démarrer')
  console.log('   2. Il peut avoir un mode de récupération de mot de passe')
  console.log('')
  
  console.log('🔵 Option 2: Réinstaller PostgreSQL')
  console.log('   1. Désinstaller PostgreSQL depuis "Ajout/Suppression de programmes"')
  console.log('   2. Redémarrer l\'ordinateur')
  console.log('   3. Réinstaller avec un mot de passe simple (ex: "postgres")')
  console.log('   4. Relancer l\'import des données')
  console.log('')
  
  console.log('🔵 Option 3: Continuer avec Docker (Recommandé)')
  console.log('   ✅ Votre PostgreSQL Docker fonctionne parfaitement')
  console.log('   ✅ pgAdmin accessible: http://localhost:8080')
  console.log('   ✅ Aucune configuration supplémentaire nécessaire')
  console.log('   💡 C\'est peut-être la solution la plus simple!')
  console.log('')
  
  console.log('🔵 Option 4: Service Cloud (Très simple)')
  console.log('   1. Aller sur https://supabase.com')
  console.log('   2. Créer un compte gratuit')
  console.log('   3. Créer un nouveau projet')
  console.log('   4. Copier l\'URL de connexion')
  console.log('   5. Importer vos données via l\'interface web')
  console.log('')
  
  console.log('🎯 MA RECOMMANDATION:\n')
  
  console.log('Pour éviter les complications:')
  console.log('1. 🐳 Gardez PostgreSQL Docker (déjà fonctionnel)')
  console.log('2. 📱 Utilisez pgAdmin: http://localhost:8080')
  console.log('3. 💾 Vos données sont déjà sauvegardées et accessibles')
  console.log('')
  
  console.log('Ou si vous voulez absolument PostgreSQL local:')
  console.log('1. 🚀 Exécutez reset_postgres_password.bat EN TANT QU\'ADMINISTRATEUR')
  console.log('2. 🔑 Choisissez un mot de passe simple (ex: "postgres")')
  console.log('3. 📦 Relancez l\'import des données')
  console.log('')
  
  console.log('💡 Que préférez-vous faire ?')
  console.log('   A) Réinitialiser le mot de passe PostgreSQL local')
  console.log('   B) Garder PostgreSQL Docker (déjà fonctionnel)')
  console.log('   C) Utiliser un service cloud (Supabase)')
}

resetPostgreSQLPassword().catch(console.error)
