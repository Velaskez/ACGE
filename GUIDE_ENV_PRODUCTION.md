# Guide Configuration Variables d'Environnement Production

## 📁 Fichier .env.production

Créez un fichier `.env.production` à la racine du projet avec ce contenu :

```env
# Configuration de production pour LWS
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production_securise_changez_ceci"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"

# Configuration FTP LWS
STORAGE_TYPE="ftp"
FTP_HOST="ftp.acge-gabon.com"
FTP_USER="acgeg2647579"
FTP_PASSWORD="Reviti2025@"
FTP_PORT="21"
FTP_SECURE="false"
UPLOAD_DIR="/uploads"
```

## 🔧 Utilisation

### Pour construire pour LWS :
```bash
npm run build:lws-simple
```

### Pour construire pour Vercel :
```bash
npm run build
```

## 📋 Différences entre LWS et Vercel

### LWS (Export statique)
- `output: 'export'`
- `distDir: 'out'`
- `images.unoptimized: true`
- Fichiers statiques HTML/CSS/JS

### Vercel (Dynamique)
- Pas d'export statique
- Serverless functions
- API routes dynamiques
- Optimisation automatique

## 🚀 Déploiement

### LWS
1. `npm run build:lws-simple`
2. Upload du dossier `out/` via FileZilla
3. Configuration DNS sur LWS

### Vercel
1. `git push origin master`
2. Déploiement automatique
3. Configuration DNS vers Vercel
