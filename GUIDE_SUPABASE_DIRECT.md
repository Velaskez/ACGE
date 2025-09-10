# 📋 GUIDE DE CONFIGURATION DIRECTE SUPABASE

## 1️⃣ **ACCÉDER AU DASHBOARD SUPABASE**

1. Ouvrez votre navigateur
2. Allez sur : https://app.supabase.com
3. Connectez-vous à votre projet

## 2️⃣ **VÉRIFIER/CRÉER LA TABLE DOCUMENTS**

### Dans le Dashboard Supabase :

1. **Allez dans "Table Editor"** (menu de gauche)
2. **Vérifiez si la table `documents` existe**

### Si elle n'existe pas, créez-la avec cette structure :

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    author_id TEXT NOT NULL,
    folder_id TEXT,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 3️⃣ **VÉRIFIER/CRÉER LE BUCKET STORAGE**

### Dans le Dashboard Supabase :

1. **Allez dans "Storage"** (menu de gauche)
2. **Vérifiez si le bucket `documents` existe**

### Si il n'existe pas :

1. Cliquez sur **"New bucket"**
2. Nom : `documents`
3. Public : ✅ (coché)
4. File size limit : 50MB
5. Allowed MIME types : 
   - application/pdf
   - application/msword
   - application/vnd.openxmlformats-officedocument.wordprocessingml.document
   - text/plain
   - image/jpeg
   - image/png

## 4️⃣ **CONFIGURER LES POLITIQUES RLS**

### Dans "Authentication" > "Policies" :

#### Pour la table `documents` :

```sql
-- Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can view all documents" 
ON documents FOR SELECT 
USING (true);

-- Insertion pour tous les utilisateurs authentifiés
CREATE POLICY "Authenticated users can insert documents" 
ON documents FOR INSERT 
WITH CHECK (true);

-- Mise à jour pour le propriétaire
CREATE POLICY "Users can update own documents" 
ON documents FOR UPDATE 
USING (author_id = auth.uid()::text);

-- Suppression pour le propriétaire
CREATE POLICY "Users can delete own documents" 
ON documents FOR DELETE 
USING (author_id = auth.uid()::text);
```

#### Pour le Storage `documents` :

```sql
-- Lecture publique
CREATE POLICY "Public read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Upload pour les utilisateurs authentifiés
CREATE POLICY "Authenticated upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');
```

## 5️⃣ **TESTER L'INSERTION DIRECTE**

### Dans "SQL Editor" de Supabase :

```sql
-- Test d'insertion directe
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
    'Document Test Direct',
    'Test depuis Supabase Dashboard',
    'test-user-id',
    'test-file.txt',
    1024,
    'text/plain',
    'documents/test-file.txt',
    false,
    '["test", "direct"]'::jsonb
);

-- Vérifier
SELECT * FROM documents ORDER BY created_at DESC LIMIT 5;
```

## 6️⃣ **VARIABLES D'ENVIRONNEMENT**

Assurez-vous que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]
```

## 7️⃣ **TEST FINAL**

Une fois tout configuré dans Supabase :

1. Redémarrez votre serveur Next.js
2. Allez sur `/upload`
3. Uploadez un fichier
4. Vérifiez dans le Dashboard Supabase :
   - Table Editor > `documents` : Le document doit apparaître
   - Storage > `documents` : Le fichier doit être présent

## ⚠️ **POINTS IMPORTANTS**

- **NE PAS** utiliser de colonnes UUID pour `author_id` et `folder_id` si vous utilisez des IDs texte
- **TOUJOURS** vérifier les types de colonnes dans le Dashboard
- **UTILISER** le SQL Editor de Supabase pour tester les requêtes
- **ACTIVER** RLS mais avec des politiques permissives pour le développement

## 🚀 **COMMANDES UTILES DANS SUPABASE SQL EDITOR**

```sql
-- Voir la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents';

-- Compter les documents
SELECT COUNT(*) FROM documents;

-- Voir les derniers documents
SELECT id, title, file_name, created_at 
FROM documents 
ORDER BY created_at DESC 
LIMIT 10;

-- Supprimer tous les documents de test
DELETE FROM documents WHERE title LIKE '%test%';
```
