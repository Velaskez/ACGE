# Instructions pour corriger le problème folderId

## Problème
La table `dossiers` ne contient pas les colonnes `folderId` et `folderName` nécessaires pour la soumission des dossiers.

## Solution
Exécutez ce SQL dans l'interface Supabase :

```sql
ALTER TABLE dossiers
ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
```

## Étapes
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet ACGE
3. Allez dans l'onglet "SQL Editor"
4. Copiez et exécutez le SQL ci-dessus
5. Testez avec: `node test-folderid-fix.js`

## Résultat attendu
Après l'exécution, l'erreur "Could not find the 'folderId' column" devrait disparaître.
