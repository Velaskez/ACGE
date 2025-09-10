-- Migration pour ajouter les colonnes manquantes à la table documents
-- À exécuter dans Supabase SQL Editor

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

-- 4. Créer des index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- 5. Vérifier la structure finale
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
