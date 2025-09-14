# Migration - Ajout de la colonne statut à la table folders

## Problème
L'erreur `Could not find the 'statut' column of 'folders' in the schema cache` indique que la colonne `statut` n'existe pas dans la table `folders` de la base de données.

## Solution

### Étape 1 : Exécuter la migration SQL
Exécutez le script SQL suivant dans votre base de données Supabase :

```sql
-- Ajouter la colonne statut à la table folders
ALTER TABLE folders 
ADD COLUMN statut VARCHAR(20) DEFAULT 'BROUILLON';

-- Mettre à jour les dossiers existants pour qu'ils aient le statut BROUILLON
UPDATE folders 
SET statut = 'BROUILLON' 
WHERE statut IS NULL;

-- Créer un index sur la colonne statut pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_folders_statut ON folders(statut);

-- Ajouter une contrainte de vérification pour s'assurer que seuls les statuts valides sont acceptés
ALTER TABLE folders 
ADD CONSTRAINT check_folders_statut 
CHECK (statut IN ('BROUILLON', 'EN_ATTENTE', 'VALIDÉ_CB', 'REJETÉ_CB', 'VALIDÉ_ORDONNATEUR', 'PAYÉ', 'TERMINÉ'));
```

### Étape 2 : Exécuter le script de migration (optionnel)
Si vous préférez utiliser un script Node.js :

```bash
node fix-folders-statut-column.js
```

### Étape 3 : Réactiver la colonne statut dans l'API
Une fois la migration exécutée, décommentez la ligne dans `src/app/api/folders/route.ts` :

```typescript
// Décommenter cette ligne :
statut: 'BROUILLON', // Statut par défaut pour les nouveaux dossiers
```

## Vérification
Après la migration, vous devriez pouvoir :
1. Créer des dossiers sans erreur
2. Voir le statut "Brouillon" sur les nouveaux dossiers
3. Utiliser le bouton "Soumettre au CB" pour soumettre manuellement

## Statuts Supportés
- `BROUILLON` : Dossier créé mais pas encore soumis
- `EN_ATTENTE` : Dossier soumis, en attente de validation
- `VALIDÉ_CB` : Dossier validé par le Contrôleur Budgétaire
- `REJETÉ_CB` : Dossier rejeté par le Contrôleur Budgétaire
- `VALIDÉ_ORDONNATEUR` : Dossier validé par l'ordonnateur
- `PAYÉ` : Dossier payé
- `TERMINÉ` : Dossier entièrement traité
