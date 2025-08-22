@echo off
echo Restauration de la configuration de production...

REM Restaurer le fichier .env de production
if exist .env.backup (
    copy .env.backup .env
    echo ✅ Configuration de production restauree
) else (
    echo ❌ Fichier de sauvegarde .env.backup non trouve
)

echo.
echo Configuration actuelle :
echo ==========================
type .env

echo.
echo ✅ Restauration terminee
pause
