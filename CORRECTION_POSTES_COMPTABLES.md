# Correction du problème des postes comptables

## Problème identifié
Les postes comptables affichaient toujours "4855 ENS" au lieu du poste comptable sélectionné par la secrétaire lors de la création des dossiers.

## Cause du problème
**Incohérence dans les noms des relations Supabase** :
- L'API de soumission des dossiers utilisait `poste_comptable:posteComptableId(*)`
- L'API cb-pending utilisait `posteComptable:posteComptableId(*)`
- Les interfaces TypeScript utilisaient `posteComptable` et `natureDocument`
- Mais les données réelles étaient dans `poste_comptable` et `nature_document`

## Corrections apportées

### 1. APIs corrigées
- ✅ `src/app/api/dossiers/cb-pending/route.ts`
- ✅ `src/app/api/dossiers/cb-rejected/route.ts`
- ✅ `src/app/api/dossiers/ordonnateur-pending/route.ts`
- ✅ `src/app/api/dossiers/ac-pending/route.ts`

**Changement** : `posteComptable:posteComptableId(*)` → `poste_comptable:posteComptableId(*)`
**Changement** : `natureDocument:natureDocumentId(*)` → `nature_document:natureDocumentId(*)`

### 2. Interfaces TypeScript corrigées
- ✅ `src/app/(protected)/cb-dashboard/page.tsx`
- ✅ `src/app/(protected)/cb-rejected/page.tsx`
- ✅ `src/app/(protected)/ordonnateur-dashboard/page.tsx`
- ✅ `src/app/(protected)/ac-dashboard/page.tsx`
- ✅ `src/app/(protected)/secretaire-rejected/page.tsx`

**Changement** : `posteComptable` → `poste_comptable`
**Changement** : `natureDocument` → `nature_document`

### 3. Affichage corrigé
Tous les endroits où les postes comptables sont affichés ont été mis à jour :
- Tableaux des dashboards
- Modals de détails
- Logs de diagnostic

## Améliorations ajoutées

### Logs de diagnostic
Ajout de logs détaillés dans l'API cb-pending pour faciliter le débogage :
```javascript
console.log(`     Poste Comptable ID: ${dossier.posteComptableId}`)
console.log(`     Poste Comptable Data:`, JSON.stringify(dossier.poste_comptable, null, 2))
```

### Script de diagnostic
Création d'un script `debug-poste-comptable.js` pour vérifier :
- Les postes comptables disponibles
- Les dossiers en attente avec leurs relations
- Le fonctionnement de l'API cb-pending

## Test des corrections

Pour tester les corrections :

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Exécuter le script de diagnostic** :
   ```bash
   node debug-poste-comptable.js
   ```

3. **Vérifier le dashboard CB** :
   - Aller sur `http://localhost:3000/cb-dashboard`
   - Vérifier que les postes comptables s'affichent correctement
   - Créer un nouveau dossier avec un poste comptable différent
   - Vérifier que le bon poste comptable s'affiche

## Résultat attendu
- Les postes comptables sélectionnés par la secrétaire doivent maintenant s'afficher correctement
- Plus de valeurs "4855 ENS" codées en dur
- Cohérence entre tous les dashboards et APIs

## Fichiers modifiés
- 4 APIs de récupération des dossiers
- 5 dashboards (interfaces TypeScript + affichage)
- 1 script de diagnostic ajouté
