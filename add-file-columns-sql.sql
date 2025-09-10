-- ========================================
-- AJOUT DES COLONNES DE FICHIER
-- ========================================
-- 
-- Instructions:
-- 1. Exécutez d'abord create-exec-sql-function.sql
-- 2. Puis exécutez ce script
-- 3. Vérifiez que les colonnes ont été ajoutées

-- ========================================
-- 1. AJOUT DES COLONNES DE FICHIER
-- ========================================

-- Nom du fichier
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Taille du fichier en bytes
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER;

-- Type MIME du fichier
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Chemin du fichier dans le storage
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;

-- URL publique du fichier
ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT;

-- Tags du document (JSON)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;

-- Visibilité du document (déjà existe, mais on s'assure)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- ========================================
-- 2. CRÉATION DES INDEX POUR LES PERFORMANCES
-- ========================================

-- Index sur le type de fichier
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);

-- Index sur la taille du fichier
CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size);

-- Index sur la visibilité
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);

-- Index GIN sur les tags (pour les recherches JSON)
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- ========================================
-- 3. COMMENTAIRES SUR LES NOUVELLES COLONNES
-- ========================================

COMMENT ON COLUMN documents.file_name IS 'Nom du fichier uploadé';
COMMENT ON COLUMN documents.file_size IS 'Taille du fichier en bytes';
COMMENT ON COLUMN documents.file_type IS 'Type MIME du fichier (ex: image/png, application/pdf)';
COMMENT ON COLUMN documents.file_path IS 'Chemin du fichier dans le storage Supabase';
COMMENT ON COLUMN documents.url IS 'URL publique du fichier';
COMMENT ON COLUMN documents.tags IS 'Tags associés au document (format JSON)';
COMMENT ON COLUMN documents.is_public IS 'Visibilité du document (true = public, false = privé)';

-- ========================================
-- 4. VÉRIFICATION DE LA STRUCTURE
-- ========================================

-- Afficher toutes les colonnes de la table documents
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 5. TEST AVEC UN DOCUMENT EXISTANT
-- ========================================

-- Vérifier qu'un document peut être récupéré avec les nouvelles colonnes
SELECT 
    id, 
    title, 
    file_name, 
    file_size, 
    file_type, 
    file_path, 
    url, 
    tags, 
    is_public
FROM documents 
LIMIT 1;

-- ========================================
-- MIGRATION TERMINÉE
-- ========================================
-- 
-- Après l'exécution de ce script:
-- 1. Les colonnes de fichier seront ajoutées à la table documents
-- 2. Les index de performance seront créés
-- 3. Vous pourrez uploader des documents avec métadonnées complètes
-- 4. L'aperçu des documents fonctionnera correctement
