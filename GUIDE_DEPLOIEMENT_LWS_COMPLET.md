# Guide Complet Déploiement LWS (FileZilla)

## 🎯 Stratégie Hybride : Vercel + LWS

### ✅ Vercel (Principal)
- Déploiement automatique
- Performance optimale
- API routes dynamiques

### 🔄 LWS (Backup)
- Contrôle total
- Indépendance technique
- Hébergement traditionnel

## 🏗️ Préparation pour LWS

### 1️⃣ Configuration Next.js

Le fichier `next.config.lws.ts` est déjà créé avec :
```typescript
output: 'export'
distDir: 'out'
images.unoptimized: true
```

### 2️⃣ Variables d'environnement

Créez `.env.production` :
```env
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production_securise_changez_ceci"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"
STORAGE_TYPE="ftp"
FTP_HOST="ftp.acge-gabon.com"
FTP_USER="acgeg2647579"
FTP_PASSWORD="Reviti2025@"
FTP_PORT="21"
FTP_SECURE="false"
UPLOAD_DIR="/uploads"
```

### 3️⃣ Script de construction

Le script `scripts/build-lws.ts` :
- Applique la config LWS
- Construit l'application
- Restaure la config Vercel
- Crée `.htaccess`
- Génère un guide d'upload

## 🚀 Déploiement LWS

### Étape 1 : Construction
```bash
# Option 1 : Script automatique
npm run build:lws-simple

# Option 2 : Manuel
cp next.config.lws.ts next.config.ts
npm run build
# Restaurer next.config.ts manuellement
```

### Étape 2 : Upload FileZilla
1. **Connexion FTP** :
   - Serveur : `ftp.acge-gabon.com`
   - Utilisateur : `acgeg2647579`
   - Mot de passe : `Reviti2025@`
   - Port : `21`

2. **Upload** :
   - Naviguer vers `public_html/`
   - Upload tout le contenu du dossier `out/`
   - Inclure le fichier `.htaccess`

### Étape 3 : Configuration DNS LWS
```
Type: A
Nom: @
Valeur: 213.255.195.45 (IP LWS par défaut)
TTL: 3600

Type: CNAME
Nom: www
Valeur: @
TTL: 3600
```

## 📁 Structure finale LWS

```
public_html/
├── _next/           (assets Next.js)
├── admin-setup/     (page admin)
├── api/             (routes API statiques)
├── login/           (page connexion)
├── .htaccess        (configuration Apache)
├── GUIDE_UPLOAD_LWS.md
└── index.html       (page d'accueil)
```

## 🔧 Configuration serveur

### Fichier .htaccess
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1 [L]
```

### Permissions
- Fichiers : 644
- Dossiers : 755
- .htaccess : 644

## 🌐 URLs de test

- **Accueil** : `https://acge-gabon.com`
- **Admin** : `https://acge-gabon.com/admin-setup`
- **Connexion** : `https://acge-gabon.com/login`

## 🔑 Identifiants Admin

- **Email** : `admin@acge-gabon.com`
- **Mot de passe** : `Admin2025!`

## ⚠️ Limitations LWS

### ❌ Fonctionnalités non disponibles
- API routes dynamiques
- Serverless functions
- Optimisation automatique des images
- Déploiement automatique

### ✅ Fonctionnalités disponibles
- Pages statiques
- Base de données MySQL
- Stockage FTP
- Authentification (avec limitations)

## 🔄 Basculement entre Vercel et LWS

### Vercel → LWS
1. Construire avec `npm run build:lws-simple`
2. Upload via FileZilla
3. Configurer DNS vers LWS

### LWS → Vercel
1. Configurer DNS vers Vercel
2. Déployer avec `git push`
3. Attendre la propagation DNS

## 📞 Support

En cas de problème :
1. Vérifier les logs Apache
2. Contrôler les permissions
3. Tester la connexion MySQL
4. Vérifier la configuration DNS

## 🎯 Recommandation

**Utilisez Vercel en principal** et gardez LWS comme backup. Cette approche vous donne :
- Performance optimale (Vercel)
- Contrôle total (LWS)
- Flexibilité maximale
- Sécurité en cas de problème
