-- Migration pour ajouter les colonnes de fichier à la table documents
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Ajouter les colonnes manquantes pour les fichiers
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size INTEGER,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS url TEXT;

-- 2. Ajouter une colonne pour les tags (JSON)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- 3. Ajouter une colonne pour la visibilité
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- 4. Créer des index pour les nouvelles colonnes (optionnel, pour les performances)
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- 5. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;

-- 6. Commentaire sur les nouvelles colonnes
COMMENT ON COLUMN documents.file_name IS 'Nom du fichier uploadé';
COMMENT ON COLUMN documents.file_size IS 'Taille du fichier en bytes';
COMMENT ON COLUMN documents.file_type IS 'Type MIME du fichier';
COMMENT ON COLUMN documents.file_path IS 'Chemin du fichier dans le storage';
COMMENT ON COLUMN documents.url IS 'URL publique du fichier';
COMMENT ON COLUMN documents.tags IS 'Tags associés au document';
COMMENT ON COLUMN documents.is_public IS 'Visibilité du document (public/privé)';
