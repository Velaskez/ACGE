@echo off
echo 🐘 Configuration PostgreSQL Local pour ACGE
echo.

echo 📋 Étape 1: Test de connexion...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d postgres -c "SELECT 'PostgreSQL connecté!' as status;"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur de connexion - vérifiez votre mot de passe
    pause
    exit /b 1
)

echo.
echo 📋 Étape 2: Création de la base acge_local...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS acge_local;"
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE acge_local;"
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de la création de la base
    pause
    exit /b 1
)

echo.
echo 📋 Étape 3: Import des données...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d acge_local -f acge_backup_full_2025-08-12T12-15-18.sql
if %ERRORLEVEL% neq 0 (
    echo ❌ Erreur lors de l'import
    pause
    exit /b 1
)

echo.
echo 📋 Étape 4: Vérification...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d acge_local -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders ORDER BY table_name;"

echo.
echo 🎉 Configuration terminée avec succès!
echo.
echo 💡 Prochaines étapes:
echo 1. Modifier .env.local avec: DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"
echo 2. Redémarrer votre application: npm run dev
echo.
pause
