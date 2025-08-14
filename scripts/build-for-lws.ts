#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync, rmSync, mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'

console.log('🏗️ Préparation de l\'application pour LWS...')

// 1. Nettoyer les builds précédents
const outDir = join(process.cwd(), 'out')
if (existsSync(outDir)) {
  rmSync(outDir, { recursive: true })
  console.log('✅ Dossier out nettoyé')
}

// 2. Build de l'application
console.log('📦 Build de l\'application...')
try {
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build terminé')
} catch (error) {
  console.error('❌ Erreur lors du build:', error)
  process.exit(1)
}

// 3. Créer le dossier de déploiement
const deployDir = join(process.cwd(), 'deploy-lws')
if (existsSync(deployDir)) {
  rmSync(deployDir, { recursive: true })
}
mkdirSync(deployDir)

// 4. Copier les fichiers nécessaires
console.log('📁 Copie des fichiers...')

// Copier le dossier out
execSync(`xcopy "out" "${deployDir}\\out" /E /I /Y`, { stdio: 'inherit' })

// Copier les fichiers de configuration
const configFiles = [
  '.htaccess',
  'web.config',
  'robots.txt'
]

configFiles.forEach(file => {
  const sourcePath = join(process.cwd(), file)
  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, join(deployDir, file))
    console.log(`✅ ${file} copié`)
  }
})

// 5. Créer le fichier .htaccess pour LWS
const htaccessContent = `# Configuration pour Next.js sur LWS
RewriteEngine On

# Rediriger vers HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Gestion des routes Next.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /out/$1 [L]

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

const htaccessPath = join(deployDir, '.htaccess')
require('fs').writeFileSync(htaccessPath, htaccessContent)
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

3. **Upload tous les fichiers du dossier 'deploy-lws'** :
   - Dossier 'out' (contenu de l'application)
   - Fichier '.htaccess' (configuration serveur)
   - Autres fichiers de configuration

4. **Structure finale** :
   public_html/
   ├── out/          (application Next.js)
   ├── .htaccess     (configuration)
   └── uploads/      (dossier pour les fichiers)

## ⚠️ Important

- Assurez-vous que le dossier 'uploads' existe avec les permissions 755
- Vérifiez que les variables d'environnement sont configurées sur le serveur
- Testez l'application après l'upload

## 🔧 Configuration serveur

Si l'application ne fonctionne pas, vérifiez :
1. Les permissions des fichiers (644 pour les fichiers, 755 pour les dossiers)
2. La configuration PHP (version 8.0+ recommandée)
3. Les modules Apache nécessaires (mod_rewrite, mod_headers)
`

const guidePath = join(deployDir, 'GUIDE_UPLOAD_LWS.md')
require('fs').writeFileSync(guidePath, uploadGuide)
console.log('✅ Guide d\'upload créé')

console.log('\n🎉 Préparation terminée !')
console.log(`📁 Dossier de déploiement : ${deployDir}`)
console.log('\n📋 Prochaines étapes :')
console.log('1. Ouvrez FileZilla')
console.log('2. Connectez-vous à votre serveur FTP LWS')
console.log('3. Upload le contenu du dossier deploy-lws vers public_html')
console.log('4. Consultez le fichier GUIDE_UPLOAD_LWS.md pour plus de détails')
