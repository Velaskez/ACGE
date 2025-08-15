@echo off
echo 🚀 Démarrage de l'application ACGE en mode développement...

REM Configuration de la base de données SQLite
set DATABASE_URL=file:./prisma/dev.db
set NEXTAUTH_SECRET=your-secret-key-here-change-in-production
set NEXTAUTH_URL=http://localhost:3000
set NODE_ENV=development

echo 📊 Configuration:
echo   - Base de données: SQLite (./prisma/dev.db)
echo   - Mode: Développement
echo   - URL: http://localhost:3000

REM Vérifier que la base de données existe
if not exist ".\prisma\dev.db" (
    echo 🗄️ Création de la base de données...
    npx prisma db push
)

REM Démarrer le serveur de développement
echo 🌐 Démarrage du serveur...
npm run dev
