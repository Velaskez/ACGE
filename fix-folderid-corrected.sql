-- Script corrigé pour ajouter les colonnes folderId et folderName à la table dossiers
-- CORRECTION: Utilise TEXT au lieu de UUID car la table folders utilise des IDs TEXT

-- Vérifier la structure actuelle de la table folders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'folders' 
AND column_name = 'id'
ORDER BY column_name;

-- Vérifier la structure actuelle de la table dossiers
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;

-- Ajouter les colonnes avec le bon type (TEXT au lieu de UUID)
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS folderId TEXT REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

-- Créer un index sur folderId pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

-- Ajouter des commentaires sur les nouvelles colonnes
COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders (TEXT)';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;

-- Test d'insertion
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
  'TEST-CORRECTED-' || extract(epoch from now()),
  'TEST-CORRECTED-NATURE',
  'Test de correction avec type TEXT',
  'Test Corrected Beneficiaire',
  'default-poste-id',
  'default-nature-id',
  'cmecmvbvy0000c1ecbq58lmtm',
  'test-folder-corrected',
  'Test Folder Corrected',
  'EN_ATTENTE',
  now(),
  now()
);

-- Vérifier l'insertion
SELECT * FROM dossiers WHERE numeroDossier LIKE 'TEST-CORRECTED-%' ORDER BY createdAt DESC LIMIT 1;

-- Nettoyer le test
DELETE FROM dossiers WHERE numeroDossier LIKE 'TEST-CORRECTED-%';
