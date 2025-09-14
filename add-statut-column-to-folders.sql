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
