-- =====================================================
-- SOLUTION DÉFINITIVE POUR LE PROBLÈME FOLDERID
-- =====================================================
-- Date: 2025-01-20
-- Description: Correction définitive du problème de casse des colonnes folderId/foldername
-- Problème: Les colonnes existent en minuscules (folderid, foldername) 
--          mais le code utilise camelCase (folderId, foldername)

-- 1. Vérifier l'état actuel des colonnes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
  AND column_name IN ('folderid', 'foldername', 'folderId', 'folderName')
ORDER BY column_name;

-- 2. Vérifier le type de la colonne id dans la table folders
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'folders' 
  AND column_name = 'id';

-- 3. Si les colonnes existent en minuscules, les renommer en camelCase
-- (Cette opération est idempotente grâce à IF EXISTS)
DO $$
BEGIN
  -- Renommer folderid en folderId si elle existe
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dossiers' AND column_name = 'folderid'
  ) THEN
    ALTER TABLE dossiers RENAME COLUMN folderid TO "folderId";
    RAISE NOTICE 'Colonne folderid renommée en folderId';
  END IF;
  
  -- Renommer foldername en foldername si elle existe (déjà en minuscules)
  -- Pas de changement nécessaire pour foldername
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dossiers' AND column_name = 'foldername'
  ) THEN
    RAISE NOTICE 'Colonne foldername existe déjà';
  END IF;
END $$;

-- 4. Si les colonnes n'existent pas du tout, les créer
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS "folderId" TEXT REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS foldername TEXT;

-- 5. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers("folderId");

-- 6. Ajouter les commentaires
COMMENT ON COLUMN dossiers."folderId" IS 'ID du dossier parent dans la table folders (TEXT)';
COMMENT ON COLUMN dossiers.foldername IS 'Nom du dossier parent pour affichage rapide';

-- 7. Vérifier le résultat final
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
  AND column_name IN ('folderId', 'foldername')
ORDER BY column_name;

-- 8. Test de contrainte de clé étrangère
-- Vérifier qu'on peut faire une jointure entre les tables
SELECT 
  d.id as dossier_id,
  d."folderId",
  d.foldername,
  f.id as folder_id,
  f.name as folder_name
FROM dossiers d
LEFT JOIN folders f ON d."folderId" = f.id
LIMIT 5;

-- 9. Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ CORRECTION TERMINÉE: Les colonnes folderId et foldername sont maintenant disponibles';
  RAISE NOTICE '✅ La soumission de dossiers devrait maintenant fonctionner correctement';
END $$;
