@echo off
echo 🔧 Réparation automatique de la base de données
echo.
echo ⚠️  Cette action peut réinitialiser votre base de données !
set /p confirm="Voulez-vous continuer ? (o/N): "
if /i "%confirm%"=="o" (
    call npx tsx scripts/auto-repair-database.ts
) else (
    echo ❌ Opération annulée.
)
pause
