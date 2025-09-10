-- =====================================================
-- SCRIPT SIMPLE POUR SUPABASE - SANS UUID PROBLÉMATIQUES
-- =====================================================

-- 1. SUPPRIMER LA TABLE SI ELLE EXISTE
DROP TABLE IF EXISTS documents CASCADE;

-- 2. CRÉER LA TABLE DOCUMENTS SANS CONTRAINTES UUID
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id TEXT NOT NULL,
    folder_id TEXT,
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
CREATE INDEX idx_documents_author_id ON documents(author_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- 4. ACTIVER RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 5. CRÉER DES POLITIQUES PERMISSIVES
CREATE POLICY "Allow all operations" 
ON documents FOR ALL 
USING (true);

-- 6. INSÉRER UN DOCUMENT DE TEST AVEC UN ID SIMPLE
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
    'Document Test Simple',
    'Document créé directement dans Supabase',
    'user-123', -- ID simple, pas d'UUID
    'test-simple.txt',
    1024,
    'text/plain',
    'documents/test-simple.txt',
    false,
    '["test", "simple"]'::jsonb
);

-- 7. VÉRIFIER
SELECT 
    id,
    title,
    file_name,
    author_id,
    created_at
FROM documents 
ORDER BY created_at DESC;

-- 8. COMPTER
SELECT COUNT(*) as total_documents FROM documents;
