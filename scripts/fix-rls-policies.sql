-- Script pour activer RLS sur les tables qui ont des politiques mais RLS désactivé
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Activer RLS sur la table 'folders'
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- 2. Activer RLS sur la table 'users'  
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est bien activé
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('folders', 'users')
ORDER BY tablename;
