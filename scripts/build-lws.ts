#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, rmSync, mkdirSync, copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'

console.log('🏗️ Construction de l\'application pour LWS...')

// 1. Nettoyer les builds précédents
const outDir = join(process.cwd(), 'out')
if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true })
  console.log('✅ Dossier out nettoyé')
}

// 2. Copier la configuration LWS
const configLws = join(process.cwd(), 'next.config.lws.ts')
const configMain = join(process.cwd(), 'next.config.ts')

if (existsSync(configLws)) {
  copyFileSync(configLws, configMain)
  console.log('✅ Configuration LWS appliquée')
}

// 3. Build de l'application
console.log('📦 Build de l\'application...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build terminé')
} catch (error) {
  console.error('❌ Erreur lors du build:', error)
  process.exit(1)
}

// 4. Restaurer la configuration Vercel
if (existsSync(configLws)) {
  // Restaurer la config originale
  const originalConfig = `import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration pour Vercel (dynamique)
  // output: 'export', // Commenté pour Vercel
  // trailingSlash: true, // Commenté pour Vercel
  // distDir: 'out', // Commenté pour Vercel
  
  // Exclure les scripts du linting pendant le build
  eslint: {
    ignoreDuringBuilds: true, // Ignorer ESLint pour LWS
  },
  
  // Exclusions TypeScript
  typescript: {
    ignoreBuildErrors: true, // Ignorer les erreurs TS
  },
  
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images pour Vercel
  images: {
    // unoptimized: true, // Commenté pour Vercel
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuration expérimentale
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Configuration webpack
  webpack: (config, { isServer }) => {
    // Résoudre le problème du loader
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;`
  
  writeFileSync(configMain, originalConfig)
  console.log('✅ Configuration Vercel restaurée')
}

// 5. Créer le fichier .htaccess pour LWS
const htaccessContent = `# Configuration pour Next.js sur LWS
RewriteEngine On

# Rediriger vers HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Gestion des routes Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1 [L]

# Headers de sécurité
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Cache pour les assets statiques
<FilesMatch "\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>

# Configuration PHP pour les API routes
<Files "*.php">
    SetHandler application/x-httpd-php
</Files>
`

const htaccessPath = join(outDir, '.htaccess')
writeFileSync(htaccessPath, htaccessContent)
console.log('✅ .htaccess créé')

// 6. Créer un guide d'upload
const uploadGuide = `# Guide d'upload vers LWS

## 📁 Fichiers à uploader via FileZilla

1. **Connectez-vous à votre serveur FTP LWS** :
   - Serveur : ftp.acge-gabon.com
   - Utilisateur : acgeg2647579
   - Mot de passe : Reviti2025@
   - Port : 21

2. **Naviguez vers le dossier public_html** (ou www)

3. **Upload tous les fichiers du dossier 'out'** :
   - Tous les fichiers HTML, CSS, JS
   - Le fichier .htaccess
   - Tous les dossiers (_next, etc.)

4. **Structure finale** :
   public_html/
   ├── _next/         (assets Next.js)
   ├── admin-setup/   (page admin)
   ├── api/           (routes API)
   ├── login/         (page connexion)
   ├── .htaccess      (configuration)
   └── index.html     (page d'accueil)

## ⚠️ Important

- Assurez-vous que le dossier 'uploads' existe avec les permissions 755
- Vérifiez que les variables d'environnement sont configurées sur le serveur
- Testez l'application après l'upload

## 🔧 Configuration serveur

Si l'application ne fonctionne pas, vérifiez :
1. Les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)
2. La configuration PHP (version 8.0+ recommandée)
3. Les modules Apache nécessaires (mod_rewrite, mod_headers)

## 🌐 URLs de test

- Accueil : https://acge-gabon.com
- Admin : https://acge-gabon.com/admin-setup
- Connexion : https://acge-gabon.com/login

## 🔑 Identifiants Admin

- Email : admin@acge-gabon.com
- Mot de passe : Admin2025!
`

const guidePath = join(outDir, 'GUIDE_UPLOAD_LWS.md')
writeFileSync(guidePath, uploadGuide)
console.log('✅ Guide d\'upload créé')

console.log('\n🎉 Construction terminée !')
console.log(`📁 Dossier de déploiement : ${outDir}`)
console.log('\n📋 Prochaines étapes :')
console.log('1. Ouvrez FileZilla')
console.log('2. Connectez-vous à votre serveur FTP LWS')
console.log('3. Upload le contenu du dossier out vers public_html')
console.log('4. Consultez le fichier GUIDE_UPLOAD_LWS.md pour plus de détails')
