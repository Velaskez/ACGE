# Test de la correction de navigation des dossiers

## Problème résolu
L'erreur `column folders.created_at does not exist` a été corrigée.

## Cause du problème
L'API des dossiers utilisait des noms de colonnes incorrects :
- ❌ `createdAt:created_at` (mapping incorrect)
- ❌ `updatedAt:updated_at` (mapping incorrect)
- ❌ `authorId` (devrait être `author_id`)

## Corrections apportées

### 1. Correction des noms de colonnes dans l'API
```typescript
// Avant (incorrect)
.select('id, name, description, parentId, createdAt:created_at, updatedAt:updated_at, authorId')

// Après (correct)
.select('id, name, description, parentId, created_at, updated_at, author_id')
```

### 2. Correction des requêtes de comptage
```typescript
// Avant (incorrect)
.eq('folderId', folderId)
.eq('parentId', folderId)
.eq('id', folder.authorId)

// Après (correct)
.eq('folder_id', folderId)
.eq('parent_id', folderId)
.eq('id', folder.author_id)
```

### 3. Mapping correct des données de réponse
```typescript
// Mapping des noms de colonnes vers camelCase
folder: {
  id: folder.id,
  name: folder.name,
  description: folder.description,
  parentId: folder.parentId,
  createdAt: folder.created_at,    // Mapping correct
  updatedAt: folder.updated_at,    // Mapping correct
  authorId: folder.author_id,      // Mapping correct
  _count: { documents: documentsCount || 0, children: childrenCount || 0 },
  author
}
```

## Comment tester

1. **Ouvrez la console du navigateur** (F12)
2. **Allez sur la page des dossiers** (`/folders`)
3. **Cliquez sur un dossier**
4. **Vérifiez les logs dans la console** :
   - `🔍 Tentative d'ouverture du dossier:` ✅
   - `🔄 Effet de chargement - folderId:` ✅
   - `📁 Appel API dossier:` ✅
   - `📁 Réponse API dossier: 200 true` ✅ (au lieu de 500)
   - `📄 Appel API documents:` ✅
   - `📄 Réponse API documents: 200 true` ✅

## Résultat attendu

- ✅ Plus d'erreur 500
- ✅ Les détails du dossier s'affichent
- ✅ Les documents du dossier s'affichent
- ✅ Navigation fonctionnelle

## Si le problème persiste

Vérifiez que :
1. Le serveur de développement est redémarré
2. Les logs de la console ne montrent plus d'erreur 500
3. L'URL change bien vers `/folders?folder={id}`
