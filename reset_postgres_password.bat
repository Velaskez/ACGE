@echo off
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
cd /d "C:\Program Files\PostgreSQL\17\data"
copy pg_hba.conf pg_hba.conf.backup > nul
powershell -Command "(Get-Content 'pg_hba.conf') -replace 'scram-sha-256', 'trust' | Set-Content 'pg_hba.conf'"

echo.
echo 📋 Étape 3: Redémarrage de PostgreSQL...
net start postgresql-x64-17

echo.
echo 📋 Étape 4: Changement du mot de passe...
echo Entrez votre nouveau mot de passe quand demandé:
set /p newpassword="Nouveau mot de passe: "

"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres PASSWORD '%newpassword%';"

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
echo "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres
echo.
pause