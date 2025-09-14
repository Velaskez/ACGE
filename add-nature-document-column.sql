-- Script SQL pour ajouter la colonne nature_document_id à la table documents
-- À exécuter dans l'interface Supabase SQL Editor

-- Vérifier si la colonne existe déjà
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' 
        AND column_name = 'nature_document_id'
    ) THEN
        -- Ajouter la colonne nature_document_id (TEXT pour correspondre à natures_documents.id)
        ALTER TABLE documents 
        ADD COLUMN nature_document_id TEXT REFERENCES natures_documents(id) ON DELETE SET NULL;
        
        -- Créer un index sur nature_document_id pour les performances
        CREATE INDEX IF NOT EXISTS idx_documents_nature_document_id ON documents(nature_document_id);
        
        -- Commentaire sur la nouvelle colonne
        COMMENT ON COLUMN documents.nature_document_id IS 'ID de la nature du document (référence vers natures_documents)';
        
        RAISE NOTICE 'Colonne nature_document_id ajoutée avec succès à la table documents';
    ELSE
        RAISE NOTICE 'La colonne nature_document_id existe déjà dans la table documents';
    END IF;
END $$;

-- Afficher la structure mise à jour de la table documents
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
