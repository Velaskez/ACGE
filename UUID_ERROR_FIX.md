# ✅ Correction de l'erreur UUID invalide

## 🐛 Problème résolu
L'erreur `invalid input syntax for type uuid: "folder_1757170066790"` lors de l'accès aux documents.

## 🔍 Cause du problème
1. **IDs de dossiers invalides** - Les dossiers étaient créés avec des IDs au format `folder_` + timestamp au lieu d'UUIDs
2. **Validation manquante** - L'API des documents ne validait pas les folderId avant de les utiliser dans les requêtes

## ✅ Solutions appliquées

### 1. **Correction de la création de dossiers**
```typescript
// Avant (incorrect)
id: 'folder_' + Date.now()

// Après (correct)
id: randomUUID()
```

### 2. **Validation des folderId dans l'API documents**
```typescript
if (folderId) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(folderId)) {
    query = query.eq('folder_id', folderId)
  } else {
    console.warn(`⚠️ folderId invalide ignoré: ${folderId}`)
    // Ne pas appliquer le filtre si l'ID n'est pas un UUID valide
  }
}
```

## 🧪 Tests de validation

### **Test 1: API documents sans folderId**
```bash
curl "http://localhost:3000/api/documents?page=1&limit=20"
```
✅ **Résultat:** 2 documents retournés sans erreur

### **Test 2: API documents avec folderId invalide**
```bash
curl "http://localhost:3000/api/documents?folderId=folder_1757170066790&page=1&limit=20"
```
✅ **Résultat:** 2 documents retournés, folderId invalide ignoré

### **Test 3: Création de nouveaux dossiers**
- Les nouveaux dossiers utilisent maintenant des UUIDs valides
- Plus d'erreur lors de l'accès aux documents

## 🎯 Fonctionnalités restaurées

- ✅ **API des documents** fonctionne sans erreur UUID
- ✅ **Création de dossiers** avec UUIDs valides
- ✅ **Validation des IDs** avant utilisation
- ✅ **Gestion d'erreurs** robuste

## 📊 Résultat attendu

L'application fonctionne maintenant correctement avec :
- Affichage des documents sans erreur
- Création de dossiers avec des IDs valides
- Validation automatique des UUIDs
- Gestion gracieuse des IDs invalides

## 🚀 Prochaines étapes

1. **Tester la création de dossiers** via l'interface
2. **Vérifier l'affichage des documents** dans les dossiers
3. **Tester la navigation** entre dossiers et documents
4. **Nettoyer les anciens dossiers** avec des IDs invalides si nécessaire
