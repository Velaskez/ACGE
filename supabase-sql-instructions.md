# Instructions pour corriger le problème folderId

## Problème identifié
La table `dossiers` ne contient pas les colonnes `folderId` et `folderName` nécessaires pour la soumission des dossiers.

## Solution : Exécuter ce SQL dans l'interface Supabase

### 1. Connectez-vous à Supabase
- Allez sur https://supabase.com/dashboard
- Sélectionnez votre projet ACGE
- Allez dans l'onglet "SQL Editor"

### 2. Exécutez ce script SQL

```sql
-- Vérifier la structure actuelle de la table dossiers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;

-- Ajouter les colonnes manquantes
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

-- Créer un index sur folderId pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

-- Ajouter des commentaires sur les nouvelles colonnes
COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;
```

### 3. Test de vérification

Après avoir exécuté le SQL, testez avec ce script :

```sql
-- Test d'insertion avec les nouvelles colonnes
INSERT INTO dossiers (
  id,
  numeroDossier,
  numeroNature,
  objetOperation,
  beneficiaire,
  posteComptableId,
  natureDocumentId,
  secretaireId,
  folderId,
  folderName,
  statut,
  createdAt,
  updatedAt
) VALUES (
  gen_random_uuid(),
  'TEST-' || extract(epoch from now()),
  'TEST-NATURE',
  'Test de soumission après correction',
  'Test Beneficiaire',
  'default-poste-id',
  'default-nature-id',
  'cmecmvbvy0000c1ecbq58lmtm',
  'test-folder-id',
  'Test Folder',
  'EN_ATTENTE',
  now(),
  now()
);

-- Vérifier l'insertion
SELECT * FROM dossiers WHERE numeroDossier LIKE 'TEST-%' ORDER BY createdAt DESC LIMIT 1;

-- Nettoyer le test
DELETE FROM dossiers WHERE numeroDossier LIKE 'TEST-%';
```

## Résultat attendu

Après l'exécution, vous devriez voir :
- Les colonnes `folderId` et `folderName` dans la table `dossiers`
- Le test d'insertion devrait réussir
- L'erreur "Could not find the 'folderId' column" devrait disparaître

## Alternative : Utiliser les migrations Supabase

Si vous préférez utiliser les migrations, vous pouvez aussi :

1. Aller dans l'onglet "Database" > "Migrations"
2. Cliquer sur "New migration"
3. Copier le contenu du fichier `supabase/migrations/20250120000001_add_folder_info_to_dossiers.sql`
4. Appliquer la migration
