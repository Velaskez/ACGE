# Correction finale du problème folderId

## Problème identifié
L'erreur `foreign key constraint "dossiers_folderid_fkey" cannot be implemented` indique que la table `folders` utilise des IDs de type `TEXT` et non `UUID`.

## Solution corrigée

### 1. Exécutez ce SQL dans l'interface Supabase

```sql
-- Vérifier la structure de la table folders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'folders' 
AND column_name = 'id'
ORDER BY column_name;

-- Ajouter les colonnes avec le bon type (TEXT au lieu de UUID)
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS folderId TEXT REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

-- Créer un index sur folderId pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

-- Ajouter des commentaires sur les nouvelles colonnes
COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders (TEXT)';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
```

### 2. Test de vérification

Après avoir exécuté le SQL, testez avec :

```bash
node test-folderid-corrected.js
```

### 3. Fichiers créés

- `fix-folderid-corrected.sql` - Script SQL corrigé
- `test-folderid-corrected.js` - Script de test corrigé

## Différence importante

**AVANT (incorrect) :**
```sql
ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id)
```

**APRÈS (correct) :**
```sql
ADD COLUMN IF NOT EXISTS folderId TEXT REFERENCES folders(id)
```

## Résultat attendu

Après l'exécution, l'erreur de contrainte de clé étrangère devrait disparaître et la soumission de dossiers devrait fonctionner correctement.
