@echo off
echo Basculement vers la configuration de developpement...

REM Sauvegarder la configuration actuelle si elle n'existe pas
if not exist .env.backup (
    copy .env .env.backup
    echo ✅ Configuration actuelle sauvegardee dans .env.backup
)

REM Créer la configuration de développement
echo DATABASE_URL="file:./prisma/dev.db" > .env
echo NEXTAUTH_SECRET="dev-secret-key-for-local-testing" >> .env
echo NEXTAUTH_URL="http://localhost:3000" >> .env

echo.
echo Configuration de developpement :
echo ================================
type .env

echo.
echo ✅ Basculement vers le developpement termine
echo.
echo Pour revenir en production, executez : restore-production-env.bat
pause
