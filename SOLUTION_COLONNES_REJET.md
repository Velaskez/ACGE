# Solution pour ajouter les colonnes de rejet manquantes

## Problème
L'erreur suivante se produit lors du rejet d'un dossier :
```
Could not find the 'rejectedAt' column of 'dossiers' in the schema cache
```

## Cause
Les colonnes suivantes manquent dans la table `dossiers` :
- `rejectedAt` (TIMESTAMP WITH TIME ZONE)
- `rejectionReason` (TEXT)
- `rejectionDetails` (TEXT)

## Solution

### Option 1 : Via l'interface Supabase (Recommandée)
1. Connectez-vous à votre projet Supabase
2. Allez dans l'onglet "SQL Editor"
3. Exécutez le script suivant :

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

### Option 2 : Via la ligne de commande Supabase
```bash
# Si vous avez accès à la clé service role
npx supabase db push --include-all
```

### Option 3 : Via l'API REST Supabase
Utilisez l'API REST de Supabase avec la clé service role pour exécuter le SQL.

## Vérification
Après avoir ajouté les colonnes, vérifiez qu'elles existent :
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('rejectedAt', 'rejectionReason', 'rejectionDetails')
ORDER BY column_name;
```

## Mise à jour des interfaces TypeScript
Après avoir ajouté les colonnes, mettez à jour les interfaces TypeScript dans :
- `src/app/(protected)/cb-dashboard/page.tsx`
- `src/app/(protected)/secretaire-rejected/page.tsx`
- `src/app/(protected)/cb-rejected/page.tsx`
- `src/app/(protected)/ac-dashboard/page.tsx`
- `src/app/(protected)/ordonnateur-dashboard/page.tsx`
- `src/components/cb/cb-status-navigation.tsx`

Ajoutez ces propriétés aux interfaces `DossierComptable` et `DossierSecrétaire` :
```typescript
rejectedAt?: string
rejectionReason?: string
rejectionDetails?: string
```

## Test
Après avoir ajouté les colonnes, testez la fonctionnalité de rejet :
1. Connectez-vous en tant que Contrôleur Budgétaire
2. Essayez de rejeter un dossier
3. Vérifiez que l'opération se déroule sans erreur
