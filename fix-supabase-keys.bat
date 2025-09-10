@echo off
echo 🔧 Correction des clés Supabase avec les vraies valeurs
echo.

REM Supprimer les anciennes clés incorrectes
echo 🗑️ Suppression des anciennes clés...
sed -i '/# Configuration Supabase (PRODUCTION)/,$d' .env.local

REM Ajouter les vraies clés depuis .env.production
echo 📋 Ajout des vraies clés Supabase...
echo. >> .env.local
echo # Configuration Supabase (PRODUCTION) - VRAIES CLÉS >> .env.local
grep "NEXT_PUBLIC_SUPABASE_URL" .env.production >> .env.local
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.production >> .env.local
grep "SUPABASE_SERVICE_ROLE_KEY" .env.production >> .env.local

echo.
echo ✅ Vraies clés Supabase configurées !
echo.
echo ⚠️  REDÉMARREZ le serveur Next.js :
echo    - Arrêtez le serveur (Ctrl+C)
echo    - Relancez : npm run dev
echo.
echo 🧪 Puis testez : http://localhost:3000/api/debug-supabase
echo.
pause
