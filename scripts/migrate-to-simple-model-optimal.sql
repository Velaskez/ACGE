-- =====================================================
-- MIGRATION OPTIMALE VERS MODÈLE SIMPLE
-- =====================================================
-- Solution à long terme pour éliminer définitivement
-- les problèmes de documents orphelins et optimiser les performances

-- 1. SAUVEGARDE DE SÉCURITÉ (optionnel mais recommandé)
-- CREATE TABLE documents_backup AS SELECT * FROM documents;
-- CREATE TABLE document_versions_backup AS SELECT * FROM document_versions;

-- 2. SUPPRIMER LES CONTRAINTES EXISTANTES
ALTER TABLE documents DROP CONSTRAINT IF EXISTS fk_current_version;

-- 3. CRÉER LA NOUVELLE TABLE AVEC STRUCTURE OPTIMALE
CREATE TABLE documents_new (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_path TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN DEFAULT FALSE,
  author_id TEXT NOT NULL,
  folder_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
);

-- 4. MIGRATION INTELLIGENTE DES DONNÉES
-- Priorité: données existantes > versions > valeurs par défaut
INSERT INTO documents_new (
  id, title, description, file_name, file_size, file_type, file_path,
  is_public, author_id, folder_id, created_at, updated_at
)
SELECT 
  d.id,
  d.title,
  d.description,
  -- Logique intelligente pour le nom de fichier
  COALESCE(
    d.file_name,  -- Si déjà présent dans documents
    dv.file_name, -- Sinon depuis document_versions
    d.title       -- Sinon utiliser le titre
  ) as file_name,
  
  -- Logique intelligente pour la taille
  COALESCE(
    d.file_size,  -- Si déjà présent dans documents
    dv.file_size, -- Sinon depuis document_versions
    0             -- Sinon 0
  ) as file_size,
  
  -- Logique intelligente pour le type
  COALESCE(
    d.file_type,  -- Si déjà présent dans documents
    dv.file_type, -- Sinon depuis document_versions
    'application/octet-stream' -- Sinon type par défaut
  ) as file_type,
  
  -- Logique intelligente pour le chemin
  COALESCE(
    d.file_path,  -- Si déjà présent dans documents
    dv.file_path, -- Sinon depuis document_versions
    ''            -- Sinon vide
  ) as file_path,
  
  -- Autres champs
  COALESCE(d.is_public, d.isPublic, false) as is_public,
  COALESCE(d.author_id, d.authorId) as author_id,
  COALESCE(d.folder_id, d.folderId) as folder_id,
  COALESCE(d.created_at, d.createdAt) as created_at,
  COALESCE(d.updated_at, d.updatedAt) as updated_at

FROM documents d
LEFT JOIN document_versions dv ON (
  d.current_version_id = dv.id OR 
  (d.current_version_id IS NULL AND dv.document_id = d.id)
)
-- Filtrer les documents valides (au moins un titre)
WHERE d.title IS NOT NULL AND d.title != '';

-- 5. SUPPRIMER L'ANCIENNE STRUCTURE
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;

-- 6. RENOMMER LA NOUVELLE TABLE
ALTER TABLE documents_new RENAME TO documents;

-- 7. CRÉER DES INDEX POUR OPTIMISER LES PERFORMANCES
CREATE INDEX IF NOT EXISTS idx_documents_author_id ON documents(author_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);

-- 8. VÉRIFICATION DE LA MIGRATION
SELECT 
  'Migration terminée' as status,
  COUNT(*) as total_documents,
  COUNT(CASE WHEN file_name IS NOT NULL AND file_name != '' THEN 1 END) as documents_with_files,
  COUNT(CASE WHEN file_size > 0 THEN 1 END) as documents_with_size,
  COUNT(CASE WHEN file_type IS NOT NULL AND file_type != '' THEN 1 END) as documents_with_type,
  COUNT(CASE WHEN file_path IS NOT NULL AND file_path != '' THEN 1 END) as documents_with_path
FROM documents;

-- 9. AFFICHER QUELQUES EXEMPLES DE DOCUMENTS MIGRÉS
SELECT 
  'Exemples de documents migrés' as info,
  id,
  title,
  file_name,
  file_size,
  file_type,
  created_at
FROM documents 
ORDER BY created_at DESC
LIMIT 5;

-- 10. STATISTIQUES DE PERFORMANCE
SELECT 
  'Statistiques de performance' as info,
  pg_size_pretty(pg_total_relation_size('documents')) as table_size,
  (SELECT COUNT(*) FROM documents) as total_records,
  (SELECT AVG(file_size) FROM documents WHERE file_size > 0) as avg_file_size
FROM documents
LIMIT 1;
