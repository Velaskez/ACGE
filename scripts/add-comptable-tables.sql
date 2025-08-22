-- Script pour ajouter les nouvelles tables comptables
-- Exécutez ce script directement dans Supabase

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

-- Ajout des colonnes manquantes dans la table users si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'SECRETAIRE';
    END IF;
END $$;
