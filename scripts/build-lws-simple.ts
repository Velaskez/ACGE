#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync, rmSync, mkdirSync, copyFileSync, writeFileSync } from 'fs'
import { join } from 'path'

console.log('🏗️ Construction simplifiée pour LWS...')

// 1. Nettoyer les builds précédents
const outDir = join(process.cwd(), 'out')
if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true })
  console.log('✅ Dossier out nettoyé')
}

// 2. Créer un fichier de configuration temporaire sans API routes
const tempConfig = `import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration pour LWS (export statique)
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  
  // Exclure les scripts du linting pendant le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Exclusions TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images pour LWS
  images: {
    unoptimized: true, // Nécessaire pour l'export statique
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

const configPath = join(process.cwd(), 'next.config.temp.ts')
writeFileSync(configPath, tempConfig)

// 3. Sauvegarder la config originale
const originalConfig = join(process.cwd(), 'next.config.ts')
const backupConfig = join(process.cwd(), 'next.config.backup.ts')

if (existsSync(originalConfig)) {
  copyFileSync(originalConfig, backupConfig)
  console.log('✅ Configuration originale sauvegardée')
}

// 4. Appliquer la config temporaire
copyFileSync(configPath, originalConfig)
console.log('✅ Configuration temporaire appliquée')

// 5. Créer un dossier temporaire pour les API routes
const apiDir = join(process.cwd(), 'src/app/api')
const apiBackupDir = join(process.cwd(), 'src/app/api.backup')

if (existsSync(apiDir)) {
  // Renommer le dossier API pour éviter les erreurs
  execSync(`move "${apiDir}" "${apiBackupDir}"`, { stdio: 'inherit' })
  console.log('✅ Dossier API temporairement déplacé')
}

// 6. Build de l'application
console.log('📦 Build de l\'application...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build terminé')
} catch (error) {
  console.error('❌ Erreur lors du build:', error)
  
  // Restaurer en cas d'erreur
  if (existsSync(backupConfig)) {
    copyFileSync(backupConfig, originalConfig)
    console.log('✅ Configuration restaurée')
  }
  if (existsSync(apiBackupDir)) {
    execSync(`move "${apiBackupDir}" "${apiDir}"`, { stdio: 'inherit' })
    console.log('✅ Dossier API restauré')
  }
  
  process.exit(1)
}

// 7. Restaurer la configuration originale
if (existsSync(backupConfig)) {
  copyFileSync(backupConfig, originalConfig)
  console.log('✅ Configuration Vercel restaurée')
}

// 8. Restaurer le dossier API
if (existsSync(apiBackupDir)) {
  execSync(`move "${apiBackupDir}" "${apiDir}"`, { stdio: 'inherit' })
  console.log('✅ Dossier API restauré')
}

// 9. Nettoyer les fichiers temporaires
if (existsSync(configPath)) rmSync(configPath)
if (existsSync(backupConfig)) rmSync(backupConfig)

// 10. Créer le fichier .htaccess pour LWS
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
`

const htaccessPath = join(outDir, '.htaccess')
writeFileSync(htaccessPath, htaccessContent)
console.log('✅ .htaccess créé')

// 11. Créer un guide d'upload
const uploadGuide = `# Guide d'upload vers LWS (Version Simplifiée)

## ⚠️ IMPORTANT : Version sans API routes

Cette version de l'application a été construite sans les API routes pour l'export statique.
Les fonctionnalités dynamiques ne sont pas disponibles.

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

## 🌐 URLs de test

- **Accueil** : https://acge-gabon.com
- **Admin Setup** : https://acge-gabon.com/admin-setup

## ⚠️ Limitations

- ❌ Pas d'API routes (authentification, upload, etc.)
- ❌ Pas de fonctionnalités dynamiques
- ✅ Pages statiques uniquement

## 🔄 Recommandation

Pour une version complète avec toutes les fonctionnalités, utilisez Vercel :
- Déploiement automatique
- API routes dynamiques
- Toutes les fonctionnalités disponibles

## 📞 Support

Si vous avez besoin de toutes les fonctionnalités, revenez à Vercel.
`

const guidePath = join(outDir, 'GUIDE_UPLOAD_LWS_SIMPLE.md')
writeFileSync(guidePath, uploadGuide)
console.log('✅ Guide d\'upload créé')

console.log('\n🎉 Construction simplifiée terminée !')
console.log(`📁 Dossier de déploiement : ${outDir}`)
console.log('\n⚠️ ATTENTION : Version sans API routes')
console.log('📋 Prochaines étapes :')
console.log('1. Ouvrez FileZilla')
console.log('2. Connectez-vous à votre serveur FTP LWS')
console.log('3. Upload le contenu du dossier out vers public_html')
console.log('4. Consultez le fichier GUIDE_UPLOAD_LWS_SIMPLE.md')
console.log('\n💡 Pour une version complète, utilisez Vercel !')
