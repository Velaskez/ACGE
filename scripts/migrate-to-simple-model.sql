-- =====================================================
-- MIGRATION VERS MODÈLE SIMPLE (SANS VERSIONS)
-- =====================================================
-- Ce script supprime complètement le système de versions
-- et simplifie le modèle de données

-- 1. Sauvegarder les données existantes (optionnel)
-- CREATE TABLE documents_backup AS SELECT * FROM documents;
-- CREATE TABLE document_versions_backup AS SELECT * FROM document_versions;

-- 2. Supprimer les contraintes de clés étrangères
ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_current_version;

-- 3. Créer la nouvelle table documents simplifiée
CREATE TABLE documents_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  author_id TEXT NOT NULL,
  folder_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- 4. Migrer les données de l'ancienne table vers la nouvelle
INSERT INTO documents_new (
  id, title, description, file_name, file_size, file_type, file_path,
  is_public, author_id, folder_id, created_at, updated_at
)
SELECT 
  d.id,
  d.title,
  d.description,
  COALESCE(dv.file_name, d.title) as file_name,
  COALESCE(dv.file_size, 0) as file_size,
  COALESCE(dv.file_type, 'application/octet-stream') as file_type,
  COALESCE(dv.file_path, '') as file_path,
  d.is_public,
  d.author_id,
  d.folder_id,
  d.created_at,
  d.updated_at
FROM documents d
LEFT JOIN document_versions dv ON (
  d.current_version_id = dv.id OR 
  (d.current_version_id IS NULL AND dv.document_id = d.id)
)
WHERE dv.id IS NOT NULL OR d.current_version_id IS NULL;

-- 5. Supprimer l'ancienne table documents
DROP TABLE IF EXISTS documents CASCADE;

-- 6. Renommer la nouvelle table
ALTER TABLE documents_new RENAME TO documents;

-- 7. Supprimer la table des versions (plus nécessaire)
DROP TABLE IF EXISTS document_versions CASCADE;

-- 8. Vérification finale
SELECT 
  'Migration terminée' as status,
  COUNT(*) as total_documents
FROM documents;

-- 9. Afficher quelques exemples de documents migrés
SELECT 
  id,
  title,
  file_name,
  file_size,
  file_type
FROM documents 
LIMIT 5;
