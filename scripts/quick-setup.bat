@echo off
echo 🚀 Configuration rapide ACGE
echo.

echo 1. Configuration de l'environnement...
call npx tsx scripts/setup-env-local.ts

echo.
echo 2. Configuration des migrations...
call npx tsx scripts/setup-prisma-migrations.ts

echo.
echo 3. Vérification de la santé...
call npx tsx scripts/check-database-health.ts

echo.
echo ✅ Configuration terminée !
echo 💡 Vous pouvez maintenant démarrer l'application avec: npm run dev
pause
