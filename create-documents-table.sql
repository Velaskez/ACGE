-- Script SQL pour créer la table documents dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id TEXT NOT NULL,
    folder_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- 3. Activer RLS (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS
CREATE POLICY "Authenticated users can view all documents" ON documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create documents" ON documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" ON documents
    FOR UPDATE USING (auth.uid()::text = author_id);

CREATE POLICY "Users can delete their own documents" ON documents
    FOR DELETE USING (auth.uid()::text = author_id);

-- 5. Vérifier la création
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
