# Script PowerShell pour créer le fichier .env.local avec la configuration MySQL LWS

$envContent = @"
# Base de données MySQL LWS
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"

# Configuration NextAuth
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="acge-secret-2025-production-change-this"

# Configuration du stockage FTP
STORAGE_TYPE="ftp"
FTP_HOST="ftp.acge-gabon.com"
FTP_USER="acgeg2647579"
FTP_PASSWORD="Reviti2025@"
FTP_PORT="21"
FTP_SECURE="false"
UPLOAD_DIR="/uploads"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"
"@

# Sauvegarder l'ancien fichier
if (Test-Path ".env.local") {
    Copy-Item ".env.local" ".env.local.backup"
    Write-Host "✅ Ancien fichier .env.local sauvegardé dans .env.local.backup"
}

# Créer le nouveau fichier
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Fichier .env.local créé avec la configuration MySQL LWS"
Write-Host ""
Write-Host "📋 Contenu du fichier :"
Write-Host "=========================="
Get-Content ".env.local"
