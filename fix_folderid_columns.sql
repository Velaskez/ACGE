-- Script pour ajouter les colonnes folderId et folderName à la table dossiers
-- À exécuter dans l'interface SQL de Supabase

-- Vérifier si les colonnes existent déjà
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName');

-- Ajouter les colonnes si elles n'existent pas
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
AND column_name IN ('folderId', 'folderName');
