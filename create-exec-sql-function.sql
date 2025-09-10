-- ========================================
-- CRÉATION DE LA FONCTION exec_sql
-- ========================================
-- 
-- Instructions:
-- 1. Copiez ce script complet
-- 2. Allez dans votre projet Supabase
-- 3. Ouvrez l'éditeur SQL
-- 4. Collez ce script et exécutez-le
-- 5. Puis exécutez le script d'ajout des colonnes

-- ========================================
-- 1. CRÉATION DE LA FONCTION exec_sql
-- ========================================

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- ========================================
-- 2. PERMISSIONS POUR LA FONCTION
-- ========================================

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- ========================================
-- 3. VÉRIFICATION DE LA FONCTION
-- ========================================

-- Tester la fonction
SELECT exec_sql('SELECT 1 as test');

-- ========================================
-- FONCTION CRÉÉE AVEC SUCCÈS
-- ========================================
-- 
-- Après l'exécution de ce script:
-- 1. La fonction exec_sql sera disponible
-- 2. Vous pourrez exécuter des requêtes SQL via l'API
-- 3. Relancez: npx tsx scripts/add-file-columns-final.ts
