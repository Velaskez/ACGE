import fs from 'fs'
import path from 'path'

async function prepareLWSUpload() {
  try {
    console.log('📦 Préparation des fichiers pour upload LWS...')

    // Vérifier que le build existe
    const outPath = path.join(process.cwd(), 'out')
    if (!fs.existsSync(outPath)) {
      console.error('❌ Dossier "out" manquant. Exécutez d\'abord : npm run build:lws')
      return
    }

    // Créer un dossier temporaire pour l'upload
    const uploadDir = path.join(process.cwd(), 'lws-upload')
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true })
    }
    fs.mkdirSync(uploadDir)

    // Copier le contenu du dossier out
    console.log('📁 Copie des fichiers de build...')
    copyDirectory(outPath, uploadDir)

    // Copier le fichier .htaccess
    const htaccessPath = path.join(process.cwd(), '.htaccess')
    if (fs.existsSync(htaccessPath)) {
      fs.copyFileSync(htaccessPath, path.join(uploadDir, '.htaccess'))
      console.log('✅ Fichier .htaccess copié')
    }

    // Créer un fichier README pour l'upload
    const readmeContent = `# Fichiers à uploader sur LWS

## Instructions d'upload :

1. Connectez-vous à votre panneau LWS
2. Allez dans "Gestionnaire de fichiers"
3. Naviguez vers le dossier racine de votre domaine (public_html ou www)
4. Supprimez tous les fichiers par défaut de LWS
5. Uploadez TOUS les fichiers de ce dossier

## Structure des fichiers :
- index.html (page d'accueil)
- _next/ (assets Next.js)
- static/ (fichiers statiques)
- .htaccess (configuration serveur)

## Après l'upload :
1. Configurez votre base MySQL sur LWS
2. Mettez à jour .env.production avec les vraies infos
3. Déployez l'API sur Vercel
4. Testez l'application

## Support :
- Consultez DEPLOYMENT_LWS_GUIDE.md pour plus de détails
- Vérifiez les logs d'erreur dans le panneau LWS si nécessaire
`

    fs.writeFileSync(path.join(uploadDir, 'README-UPLOAD.md'), readmeContent)

    console.log('\n✅ Préparation terminée !')
    console.log(`📁 Dossier prêt : ${uploadDir}`)
    console.log('\n📋 Prochaines étapes :')
    console.log('1. Uploadez le contenu du dossier "lws-upload/" sur LWS')
    console.log('2. Configurez votre base MySQL sur LWS')
    console.log('3. Mettez à jour .env.production')
    console.log('4. Déployez l\'API sur Vercel')
    console.log('5. Testez votre application sur acge-gabon.com')

  } catch (error) {
    console.error('❌ Erreur lors de la préparation:', error)
  }
}

function copyDirectory(src: string, dest: string) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// Exécuter le script
prepareLWSUpload()
