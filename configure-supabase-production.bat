@echo off
echo 🚀 Configuration Supabase Production pour ACGE
echo.

echo 📝 Ajout des variables Supabase dans .env.local...

echo # Configuration Supabase (PRODUCTION) >> .env.local
echo NEXT_PUBLIC_SUPABASE_URL="https://wodyrsasfqfoqdydrfew.supabase.co" >> .env.local
echo NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzEyMjcsImV4cCI6MjA1MDIwNzIyN30.cGLPAqBfkC1CxJkrCJPdYlj7hW8x5FQFyOe9f8Nz8Vo" >> .env.local
echo SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDYzMTIyNywiZXhwIjoyMDUwMjA3MjI3fQ.8Qx2Nh5vJYwKkFj9XzM4Lp3R7Qs6Wt1Yv0Eu8Cv2Nz4" >> .env.local

echo.
echo ✅ Variables Supabase ajoutées dans .env.local
echo.
echo ⚠️  IMPORTANT: Redémarrez votre serveur Next.js pour que les variables soient prises en compte:
echo    - Arrêtez le serveur (Ctrl+C)
echo    - Relancez: npm run dev
echo.
echo 🧪 Pour tester la configuration:
echo    - http://localhost:3000/api/debug-auth
echo.
pause
