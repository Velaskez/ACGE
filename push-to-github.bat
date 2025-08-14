@echo off
echo 🚀 Push vers GitHub...

echo 📋 Statut Git :
git status

echo.
echo 📦 Ajout des fichiers...
git add .

echo.
echo 💾 Commit des modifications...
git commit -m "Deploy ACGE application to LWS - Static export ready"

echo.
echo 📤 Push vers GitHub...
git push origin main

echo.
echo ✅ Push terminé avec succès !
echo 🌐 Le déploiement automatique devrait se déclencher sur Vercel

pause
