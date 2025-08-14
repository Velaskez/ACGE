@echo off
echo 🔍 Test de connexion à la base de données locale...
echo.

echo 📋 Vérification des fichiers de configuration :
echo - .env.local : 
if exist .env.local (
    echo   ✅ Fichier .env.local trouvé
) else (
    echo   ❌ Fichier .env.local manquant
)

echo - prisma/dev.db :
if exist prisma\dev.db (
    echo   ✅ Base de données SQLite trouvée
) else (
    echo   ❌ Base de données SQLite manquante
)

echo.
echo 🔧 Génération du client Prisma...
npx prisma generate

echo.
echo 📊 Test de connexion...
npx tsx scripts/test-db-connection.ts

echo.
echo 💡 Si la connexion échoue :
echo 1. Créez un fichier .env.local avec DATABASE_URL="file:./prisma/dev.db"
echo 2. Exécutez : npm run db:push
echo 3. Exécutez : npm run create-admin
echo.

pause
