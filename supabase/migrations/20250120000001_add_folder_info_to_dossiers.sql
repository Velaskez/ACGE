-- Migration pour ajouter les informations du dossier parent dans la table dossiers
-- Date: 2025-01-20
-- Description: Ajoute folderId et folderName pour lier les dossiers comptables aux dossiers

-- Ajouter les colonnes folderId et folderName à la table dossiers
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

-- Créer un index sur folderId pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

-- Commentaire sur les nouvelles colonnes
COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
