@echo off
echo 🚀 Lancement rapide de Prisma Studio
echo.

echo 📋 Configuration des variables d'environnement...
set DATABASE_URL=postgresql://acge_user:acge_password_dev@localhost:5433/acge_database
set NEXTAUTH_SECRET=unified-jwt-secret-for-development
set NEXTAUTH_URL=http://localhost:3000

echo ✅ Variables configurées
echo.

echo 🔍 Test de connexion PostgreSQL...
docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT 1;" > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ PostgreSQL Docker non accessible
    echo 💡 Démarrez Docker: docker-compose up -d
    pause
    exit /b 1
)

echo ✅ PostgreSQL accessible
echo.

echo 🚀 Lancement de Prisma Studio...
echo 📱 URL: http://localhost:5555
echo 💡 Fermez cette fenêtre pour arrêter Prisma Studio
echo.

npx prisma studio

echo.
echo 👋 Prisma Studio fermé
pause
