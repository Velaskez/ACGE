# Résumé de la solution pour les colonnes de rejet manquantes

## Problème identifié
L'erreur suivante se produit lors du rejet d'un dossier :
```
Could not find the 'rejectedAt' column of 'dossiers' in the schema cache
```

## Cause
Les colonnes suivantes manquent dans la table `dossiers` :
- `rejectedAt` (TIMESTAMP WITH TIME ZONE)
- `rejectionReason` (TEXT)  
- `rejectionDetails` (TEXT)

## Solutions implémentées

### ✅ 1. Migration SQL créée
- Fichier : `supabase/migrations/20250124000001_add_rejection_columns_to_dossiers.sql`
- Contient le SQL pour ajouter les colonnes manquantes et les index

### ✅ 2. Interfaces TypeScript mises à jour
Les interfaces suivantes ont été mises à jour pour inclure les colonnes de rejet :
- `src/app/(protected)/cb-dashboard/page.tsx` - Interface `DossierComptable`
- `src/app/(protected)/secretaire-rejected/page.tsx` - Interface `DossierSecrétaire`
- `src/app/(protected)/cb-rejected/page.tsx` - Interface `DossierComptable`
- `src/app/(protected)/ac-dashboard/page.tsx` - Interface `DossierComptable`
- `src/app/(protected)/ordonnateur-dashboard/page.tsx` - Interface `DossierComptable`
- `src/components/cb/cb-status-navigation.tsx` - Interface `DossierComptable`

### ✅ 3. API administrative créée
- Route : `src/app/api/admin/add-rejection-columns/route.ts`
- Permet de vérifier et ajouter les colonnes via l'API

### ✅ 4. Documentation créée
- `SOLUTION_COLONNES_REJET.md` - Instructions détaillées
- `RESUME_SOLUTION_COLONNES_REJET.md` - Ce résumé

## Actions requises

### 🔧 Étape 1 : Ajouter les colonnes à la base de données
Exécutez le SQL suivant dans l'interface Supabase :

```sql
-- Ajouter les colonnes de rejet à la table dossiers
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionDetails" TEXT;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_rejected_at ON dossiers("rejectedAt");
CREATE INDEX IF NOT EXISTS idx_dossiers_rejection_reason ON dossiers("rejectionReason");

-- Ajouter des commentaires
COMMENT ON COLUMN dossiers."rejectedAt" IS 'Date et heure du rejet du dossier par le Contrôleur Budgétaire';
COMMENT ON COLUMN dossiers."rejectionReason" IS 'Motif du rejet du dossier';
COMMENT ON COLUMN dossiers."rejectionDetails" IS 'Détails supplémentaires du rejet (optionnel)';
```

### 🔧 Étape 2 : Vérifier que les colonnes ont été ajoutées
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('rejectedAt', 'rejectionReason', 'rejectionDetails')
ORDER BY column_name;
```

### 🔧 Étape 3 : Tester la fonctionnalité de rejet
1. Connectez-vous en tant que Contrôleur Budgétaire
2. Essayez de rejeter un dossier
3. Vérifiez que l'opération se déroule sans erreur

## Fichiers modifiés
- `supabase/migrations/20250124000001_add_rejection_columns_to_dossiers.sql` (nouveau)
- `src/app/api/admin/add-rejection-columns/route.ts` (nouveau)
- `src/app/(protected)/cb-dashboard/page.tsx` (modifié)
- `src/app/(protected)/secretaire-rejected/page.tsx` (modifié)
- `src/app/(protected)/cb-rejected/page.tsx` (modifié)
- `src/app/(protected)/ac-dashboard/page.tsx` (modifié)
- `src/app/(protected)/ordonnateur-dashboard/page.tsx` (modifié)
- `src/components/cb/cb-status-navigation.tsx` (modifié)

## Statut
- ✅ Migration SQL créée
- ✅ Interfaces TypeScript mises à jour
- ✅ API administrative créée
- ✅ Documentation créée
- ⏳ **Action requise** : Exécuter le SQL dans Supabase
- ⏳ **Action requise** : Tester la fonctionnalité de rejet

Une fois le SQL exécuté dans Supabase, la fonctionnalité de rejet des dossiers devrait fonctionner correctement.
