# Test de la correction de l'upload

## Problème résolu
L'erreur "Utilisateur non trouvé" a été corrigée en simplifiant l'API d'upload.

## Cause du problème
L'API d'upload essayait d'utiliser Supabase pour :
1. Récupérer l'utilisateur depuis la base de données
2. Sauvegarder les fichiers dans Supabase Storage
3. Enregistrer les métadonnées en base

Mais la configuration Supabase n'était pas disponible.

## Corrections apportées

### 1. Authentification simplifiée
```typescript
// Avant (problématique)
const { data: user, error: userError } = await supabase
  .from('users')
  .select('id, email, name')
  .eq('email', userEmail)
  .single()

// Après (simplifié)
const decoded = verify(token, process.env.NEXTAUTH_SECRET)
const userId = decoded.userId // Utilise directement l'ID du token JWT
```

### 2. Stockage local au lieu de Supabase Storage
```typescript
// Avant (Supabase Storage)
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('documents')
  .upload(filePath, buffer, { contentType: file.type })

// Après (Stockage local)
const filePath = join(uploadDir, fileName)
await writeFile(filePath, buffer)
```

### 3. Suppression de la sauvegarde en base
- L'upload fonctionne maintenant sans dépendance à la base de données
- Les fichiers sont sauvegardés localement dans le dossier `uploads/`
- Les métadonnées ne sont pas sauvegardées pour l'instant

## Comment tester

1. **Connectez-vous à l'application** (si ce n'est pas déjà fait)
2. **Allez sur la page d'upload** (`/upload`)
3. **Sélectionnez un ou plusieurs fichiers**
4. **Cliquez sur "Uploader les fichiers"**
5. **Vérifiez les logs dans la console du navigateur** :
   - `✅ Utilisateur authentifié:` - doit afficher l'email
   - `✅ ID utilisateur récupéré du token:` - doit afficher l'ID
   - `✅ Fichier sauvegardé localement:` - doit afficher le chemin
   - `✅ Upload local réussi` - confirmation finale

## Résultat attendu

- ✅ Plus d'erreur "Utilisateur non trouvé"
- ✅ Les fichiers sont uploadés avec succès
- ✅ Les fichiers sont sauvegardés dans le dossier `uploads/`
- ✅ Message de succès affiché dans l'interface

## Vérification des fichiers uploadés

Les fichiers sont sauvegardés dans :
```
C:\Users\nexon\ACGE\ACGE -app\uploads\
```

Format des noms de fichiers :
```
{timestamp}-{randomSuffix}-{nom_original}
```

Exemple : `1703123456789-abc123-document.pdf`

## Si le problème persiste

1. Vérifiez que vous êtes bien connecté (cookie `auth-token` présent)
2. Vérifiez les logs de la console pour voir où ça bloque
3. Vérifiez que le dossier `uploads/` est créé automatiquement
4. Vérifiez les permissions d'écriture dans le dossier du projet
