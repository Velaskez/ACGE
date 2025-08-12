@echo off
echo 🏥 Vérification de la santé de la base de données
echo.
call npx tsx scripts/check-database-health.ts
pause
