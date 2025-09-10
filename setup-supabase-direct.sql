-- =====================================================
-- SCRIPT DE CONFIGURATION DIRECTE SUPABASE
-- À exécuter dans SQL Editor du Dashboard Supabase
-- =====================================================

-- 1. SUPPRIMER LA TABLE SI ELLE EXISTE (ATTENTION!)
-- DROP TABLE IF EXISTS documents CASCADE;

-- 2. CRÉER LA TABLE DOCUMENTS AVEC LA BONNE STRUCTURE
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id TEXT NOT NULL, -- TEXT, pas UUID!
    folder_id TEXT, -- TEXT, pas UUID!
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    file_path TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRÉER LES INDEX
CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);

-- 4. ACTIVER RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER LES POLITIQUES RLS (PERMISSIVES POUR LE DEV)
-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Authenticated users can view all documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

-- Créer les nouvelles politiques
CREATE POLICY "Anyone can view documents" 
ON documents FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert documents" 
ON documents FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update documents" 
ON documents FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete documents" 
ON documents FOR DELETE 
USING (true);

-- 6. CRÉER UN TRIGGER POUR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at 
BEFORE UPDATE ON documents 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 7. INSÉRER UN DOCUMENT DE TEST
INSERT INTO documents (
    title,
    description,
    author_id,
    file_name,
    file_size,
    file_type,
    file_path,
    is_public,
    tags
) VALUES (
    'Document Test Supabase',
    'Document créé directement dans Supabase',
    'cmebotah-v000-0c17-w3iz-kh2k9', -- UUID valide
    'test-supabase.txt',
    1024,
    'text/plain',
    'documents/test-supabase.txt',
    false,
    '["test", "supabase", "direct"]'::jsonb
);

-- 8. VÉRIFIER QUE TOUT FONCTIONNE
SELECT 
    id,
    title,
    file_name,
    file_size,
    author_id,
    created_at
FROM documents 
ORDER BY created_at DESC 
LIMIT 5;

-- 9. AFFICHER LE NOMBRE TOTAL DE DOCUMENTS
SELECT COUNT(*) as total_documents FROM documents;
