# Script PowerShell pour créer le fichier .env.local avec la configuration de développement local

$envContent = @"
# Base de données SQLite locale pour les tests
DATABASE_URL="file:./prisma/dev.db"

# NextAuth pour développement local
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"

# URL de base pour les API locales
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Configuration upload locale
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"

# Configuration Supabase (pour développement local)
# REMPLACEZ CES VALEURS PAR VOS VRAIES VALEURS SUPABASE
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
"@

# Sauvegarder l'ancien fichier
if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env.local.backup"
    Write-Host "✅ Ancien fichier .env.local sauvegardé dans .env.local.backup"
}

# Créer le nouveau fichier
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Fichier .env.local créé avec la configuration de développement local"
Write-Host ""
Write-Host "⚠️  IMPORTANT: Remplacez les valeurs Supabase par vos vraies valeurs !"
Write-Host ""
Write-Host "📋 Contenu du fichier :"
Write-Host "=========================="
if (Test-Path ".env.local") {
    Get-Content ".env.local"
}
