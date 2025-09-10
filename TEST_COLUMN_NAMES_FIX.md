# Test de la correction des noms de colonnes

## Problème résolu
L'erreur `column folders.created_at does not exist` a été corrigée en utilisant les vrais noms de colonnes de la base de données.

## Cause du problème
La base de données utilise des noms de colonnes en **camelCase** :
- ✅ `createdAt` (pas `created_at`)
- ✅ `updatedAt` (pas `updated_at`)
- ✅ `authorId` (pas `author_id`)
- ✅ `folderId` (pas `folder_id`)

## Corrections apportées

### 1. API des dossiers (`/api/folders/[id]`)
```typescript
// Avant (incorrect)
.select('id, name, description, parentId, created_at, updated_at, author_id')

// Après (correct)
.select('id, name, description, parentId, createdAt, updatedAt, authorId')
```

### 2. API des documents (`/api/documents`)
```typescript
// Avant (incorrect)
.select('id, title, description, author_id, folder_id, created_at, updated_at, file_name, file_size, file_type, file_path')

// Après (correct)
.select('id, title, description, authorId, folderId, createdAt, updatedAt, fileName, fileSize, fileType, filePath')
```

### 3. Requêtes de filtrage
```typescript
// Avant (incorrect)
.eq('folder_id', folderId)
.eq('parent_id', folderId)

// Après (correct)
.eq('folderId', folderId)
.eq('parentId', folderId)
```

## Comment tester

1. **Ouvrez la console du navigateur** (F12)
2. **Allez sur la page des dossiers** (`/folders`)
3. **Cliquez sur un dossier**
4. **Vérifiez les logs dans la console** :
   - `📁 Réponse API dossier: 200 true` ✅ (au lieu de 500)
   - `📄 Réponse API documents: 200 true` ✅
   - Plus d'erreur de colonne manquante

## Résultat attendu

- ✅ Plus d'erreur 500
- ✅ Les détails du dossier s'affichent
- ✅ Les documents du dossier se chargent
- ✅ Navigation fonctionnelle

## Si le problème persiste

Vérifiez que :
1. Le serveur de développement est redémarré
2. Les logs de la console ne montrent plus d'erreur 500
3. L'URL change bien vers `/folders?folder={id}`
