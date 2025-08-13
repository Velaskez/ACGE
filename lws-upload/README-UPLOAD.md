# Fichiers à uploader sur LWS

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
