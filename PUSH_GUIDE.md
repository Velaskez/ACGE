# 🚀 Guide de Push vers GitHub

## Problème
Le terminal PowerShell ne répond pas correctement aux commandes Git.

## Solutions

### Option 1 : Fichier Batch (Recommandé)
1. Double-cliquez sur le fichier `push-to-github.bat`
2. Suivez les instructions à l'écran
3. Le script exécutera automatiquement :
   - `git status`
   - `git add .`
   - `git commit -m "Deploy ACGE application to LWS - Static export ready"`
   - `git push origin main`

### Option 2 : Commandes Manuelles
Ouvrez un nouveau terminal PowerShell et exécutez :

```powershell
# Vérifier le statut
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "Deploy ACGE application to LWS - Static export ready"

# Push
git push origin main
```

### Option 3 : Git Bash
Si vous avez Git Bash installé :
1. Ouvrez Git Bash
2. Naviguez vers votre projet
3. Exécutez les mêmes commandes

## Vérification

Après le push, vérifiez que :
1. ✅ Les modifications sont sur GitHub
2. ✅ Le déploiement Vercel se déclenche automatiquement
3. ✅ L'API est mise à jour

## Prochaines Étapes

Une fois le push effectué :
1. **LWS** : Uploadez le contenu de `lws-upload/` sur votre hébergement
2. **Base de données** : Configurez MySQL sur LWS
3. **Test** : Vérifiez `https://acge-gabon.com`

## Support

Si le push échoue :
1. Vérifiez votre connexion internet
2. Vérifiez vos credentials Git
3. Essayez `git pull origin main` d'abord
4. Contactez le support si nécessaire
