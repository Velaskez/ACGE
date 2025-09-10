# Guide de débogage - Navigation des dossiers

## Problème identifié
Vous ne pouvez pas accéder aux dossiers en cliquant dessus.

## Corrections apportées

### 1. Logs de débogage ajoutés
J'ai ajouté des logs de débogage dans le fichier `src/app/(protected)/folders/page.tsx` pour tracer :
- Les tentatives d'ouverture de dossier
- Les appels API vers `/api/folders/{id}`
- Les appels API vers `/api/documents?folderId={id}`
- Les réponses des APIs

### 2. Correction des types TypeScript
- Utilisation de l'interface `DocumentItem` correcte depuis `src/types/document.ts`
- Correction des propriétés manquantes (`fileName`, `fileSize`, `fileType`, `filePath`)

### 3. Amélioration de la gestion des erreurs
- Meilleure gestion des erreurs API
- Affichage des erreurs dans l'interface utilisateur

## Comment tester

1. **Ouvrez la console du navigateur** (F12)
2. **Allez sur la page des dossiers** (`/folders`)
3. **Cliquez sur un dossier**
4. **Vérifiez les logs dans la console** :
   - `🔍 Tentative d'ouverture du dossier:` - doit afficher les détails du dossier
   - `🔄 Effet de chargement - folderId:` - doit afficher l'ID du dossier
   - `📁 Appel API dossier:` - doit afficher l'URL de l'API
   - `📁 Réponse API dossier:` - doit afficher le statut de la réponse
   - `📄 Appel API documents:` - doit afficher l'URL de l'API documents
   - `📄 Réponse API documents:` - doit afficher le statut de la réponse

## Problèmes possibles

### 1. Erreur 404 sur l'API dossier
Si vous voyez `❌ Erreur API dossier: 404`, cela signifie que l'API ne trouve pas le dossier.

### 2. Erreur 500 sur l'API
Si vous voyez `❌ Erreur API dossier: 500`, il y a un problème côté serveur.

### 3. Problème de routage
Si l'URL ne change pas après le clic, il y a un problème avec le router Next.js.

### 4. Problème de données
Si les APIs répondent mais que les documents ne s'affichent pas, vérifiez la structure des données.

## Solutions

### Si l'API dossier ne fonctionne pas :
1. Vérifiez que le serveur de développement est démarré
2. Vérifiez les logs du serveur pour voir les erreurs
3. Testez l'API directement : `http://localhost:3000/api/folders/{id}`

### Si l'API documents ne fonctionne pas :
1. Vérifiez que l'API documents accepte le paramètre `folderId`
2. Testez l'API directement : `http://localhost:3000/api/documents?folderId={id}`

### Si le routage ne fonctionne pas :
1. Vérifiez que vous êtes sur la bonne page
2. Vérifiez que le router Next.js est correctement configuré

## Prochaines étapes

1. Testez la navigation avec les logs de débogage
2. Partagez-moi les logs de la console si le problème persiste
3. Je pourrai alors identifier la cause exacte et la corriger
