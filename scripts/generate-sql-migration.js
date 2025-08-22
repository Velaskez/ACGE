const fs = require('fs');
const path = require('path');

function generateSqlMigration() {
  const sql = `-- Migration SQL pour créer les tables comptables
-- Copiez ce script et exécutez-le dans l'éditeur SQL de Supabase

-- 1. Table UserSettings
CREATE TABLE IF NOT EXISTS "user_settings" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
  "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
  "language" TEXT NOT NULL DEFAULT 'fr',
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Libreville',
  "sessionTimeout" INTEGER NOT NULL DEFAULT 15,
  "passwordExpiry" INTEGER NOT NULL DEFAULT 90,
  "theme" TEXT NOT NULL DEFAULT 'system',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- 2. Table PosteComptable
CREATE TABLE IF NOT EXISTS "postes_comptables" (
  "id" TEXT NOT NULL,
  "numero" TEXT NOT NULL,
  "intitule" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "postes_comptables_pkey" PRIMARY KEY ("id")
);

-- 3. Table NatureDocument
CREATE TABLE IF NOT EXISTS "natures_documents" (
  "id" TEXT NOT NULL,
  "numero" TEXT NOT NULL,
  "nom" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "natures_documents_pkey" PRIMARY KEY ("id")
);

-- 4. Table Dossier
CREATE TABLE IF NOT EXISTS "dossiers" (
  "id" TEXT NOT NULL,
  "numeroDossier" TEXT NOT NULL,
  "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "numeroNature" TEXT NOT NULL,
  "objetOperation" TEXT NOT NULL,
  "beneficiaire" TEXT NOT NULL,
  "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "posteComptableId" TEXT NOT NULL,
  "natureDocumentId" TEXT NOT NULL,
  "secretaireId" TEXT NOT NULL,
  CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
);

-- 5. Table ValidationDossier
CREATE TABLE IF NOT EXISTS "validations_dossiers" (
  "id" TEXT NOT NULL,
  "statut" TEXT NOT NULL,
  "commentaire" TEXT,
  "dateValidation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dossierId" TEXT NOT NULL,
  "validateurId" TEXT NOT NULL,
  CONSTRAINT "validations_dossiers_pkey" PRIMARY KEY ("id")
);

-- Ajout des contraintes uniques
CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_userId_key" ON "user_settings"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "postes_comptables_numero_key" ON "postes_comptables"("numero");
CREATE UNIQUE INDEX IF NOT EXISTS "natures_documents_numero_key" ON "natures_documents"("numero");
CREATE UNIQUE INDEX IF NOT EXISTS "dossiers_numeroDossier_key" ON "dossiers"("numeroDossier");

-- Ajout des clés étrangères
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_posteComptableId_fkey" FOREIGN KEY ("posteComptableId") REFERENCES "postes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_natureDocumentId_fkey" FOREIGN KEY ("natureDocumentId") REFERENCES "natures_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_secretaireId_fkey" FOREIGN KEY ("secretaireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "validations_dossiers" ADD CONSTRAINT "validations_dossiers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "validations_dossiers" ADD CONSTRAINT "validations_dossiers_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ajout de la colonne role dans users si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'SECRETAIRE';
  END IF;
END $$;

-- Données de test pour les postes comptables
INSERT INTO "postes_comptables" ("id", "numero", "intitule", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '4855', 'ENS', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4856', 'ENSET', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4857', 'INSG', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4858', 'IUSO', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4860', 'ENA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4861', 'EPCA', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '4862', 'IEF', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("numero") DO NOTHING;

-- Données de test pour les natures de documents
INSERT INTO "natures_documents" ("id", "numero", "nom", "description", "isActive", "createdAt", "updatedAt") VALUES
  (gen_random_uuid(), '001', 'Ordre recettes', 'Ordre de recettes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '002', 'Ordre paiement', 'Ordre de paiement', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), '003', 'Courrier', 'Courrier administratif', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("numero") DO NOTHING;

-- Vérification des tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_settings', 'postes_comptables', 'natures_documents', 'dossiers', 'validations_dossiers')
ORDER BY table_name;
`;

  // Écrire le fichier SQL
  const outputPath = path.join(__dirname, 'migration-comptable.sql');
  fs.writeFileSync(outputPath, sql);
  
  console.log('📝 Fichier SQL généré : scripts/migration-comptable.sql');
  console.log('\n📋 Instructions :');
  console.log('1. Ouvrez Supabase Dashboard');
  console.log('2. Allez dans SQL Editor');
  console.log('3. Copiez le contenu du fichier migration-comptable.sql');
  console.log('4. Exécutez le script');
  console.log('\n✅ Les tables comptables seront créées avec les données de test !');
  
  return outputPath;
}

generateSqlMigration();
