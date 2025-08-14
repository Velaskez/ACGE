-- 🗂️ Politiques de sécurité Supabase Storage
-- Exécutez ce fichier dans le SQL Editor de votre dashboard Supabase

-- 1. Politique pour l'upload (INSERT)
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Politique pour le download (SELECT)
DROP POLICY IF EXISTS "Users can download their own files" ON storage.objects;
CREATE POLICY "Users can download their own files" ON storage.objects
FOR SELECT USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique pour la suppression (DELETE)
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Politique pour la mise à jour (UPDATE)
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Vérification des politiques créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
