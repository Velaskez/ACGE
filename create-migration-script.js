// Script pour créer une migration Supabase et l'appliquer
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const createAndApplyMigration = async () => {
  try {
    console.log('📝 === CRÉATION ET APPLICATION DE MIGRATION ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    // Créer un fichier de migration
    const migrationContent = `-- Migration pour ajouter les colonnes folderId et folderName
-- Date: ${new Date().toISOString()}
-- Description: Ajoute folderId et folderName pour lier les dossiers comptables aux dossiers

-- Vérifier la structure actuelle
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;

-- Ajouter les colonnes folderId et folderName à la table dossiers
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS folderName TEXT;

-- Créer un index sur folderId pour les performances
CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);

-- Commentaire sur les nouvelles colonnes
COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'dossiers' 
AND column_name IN ('folderId', 'folderName')
ORDER BY column_name;

-- Test d'insertion
INSERT INTO dossiers (
  id,
  numeroDossier,
  numeroNature,
  objetOperation,
  beneficiaire,
  posteComptableId,
  natureDocumentId,
  secretaireId,
  folderId,
  folderName,
  statut,
  createdAt,
  updatedAt
) VALUES (
  gen_random_uuid(),
  'MIGRATION-TEST-' || extract(epoch from now()),
  'MIGRATION-TEST-NATURE',
  'Test de migration folderId',
  'Test Migration Beneficiaire',
  'default-poste-id',
  'default-nature-id',
  'cmecmvbvy0000c1ecbq58lmtm',
  'test-folder-migration',
  'Test Folder Migration',
  'EN_ATTENTE',
  now(),
  now()
);

-- Vérifier l'insertion
SELECT * FROM dossiers WHERE numeroDossier LIKE 'MIGRATION-TEST-%' ORDER BY createdAt DESC LIMIT 1;

-- Nettoyer le test
DELETE FROM dossiers WHERE numeroDossier LIKE 'MIGRATION-TEST-%';
`;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const migrationFileName = `${timestamp}_add_folder_columns_manual.sql`;
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', migrationFileName);
    
    // Créer le répertoire migrations s'il n'existe pas
    const migrationsDir = path.dirname(migrationPath);
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    // Écrire le fichier de migration
    fs.writeFileSync(migrationPath, migrationContent);
    console.log('✅ Fichier de migration créé:', migrationFileName);
    
    // Créer un script d'application de migration
    const applyScript = `#!/bin/bash
# Script pour appliquer la migration folderId

echo "🔧 Application de la migration folderId..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé"
    echo "📝 Installez-le avec: npm install -g supabase"
    exit 1
fi

# Appliquer la migration
echo "📤 Application de la migration..."
supabase db push --include-all

if [ $? -eq 0 ]; then
    echo "✅ Migration appliquée avec succès"
else
    echo "❌ Erreur lors de l'application de la migration"
    echo "💡 Essayez d'exécuter le SQL manuellement dans l'interface Supabase"
fi
`;

    const scriptPath = path.join(__dirname, 'apply-folderid-migration.sh');
    fs.writeFileSync(scriptPath, applyScript);
    fs.chmodSync(scriptPath, '755');
    console.log('✅ Script d\'application créé: apply-folderid-migration.sh');
    
    // Créer un script PowerShell pour Windows
    const powershellScript = `# Script PowerShell pour appliquer la migration folderId

Write-Host "🔧 Application de la migration folderId..." -ForegroundColor Green

# Vérifier si Supabase CLI est installé
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI trouvé: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI n'est pas installé" -ForegroundColor Red
    Write-Host "📝 Installez-le avec: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Appliquer la migration
Write-Host "📤 Application de la migration..." -ForegroundColor Blue
supabase db push --include-all

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration appliquée avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'application de la migration" -ForegroundColor Red
    Write-Host "💡 Essayez d'exécuter le SQL manuellement dans l'interface Supabase" -ForegroundColor Yellow
}
`;

    const psScriptPath = path.join(__dirname, 'apply-folderid-migration.ps1');
    fs.writeFileSync(psScriptPath, powershellScript);
    console.log('✅ Script PowerShell créé: apply-folderid-migration.ps1');
    
    // Créer un fichier README avec les instructions
    const readmeContent = `# Correction du problème folderId

## Problème
La table \`dossiers\` ne contient pas les colonnes \`folderId\` et \`folderName\` nécessaires pour la soumission des dossiers.

## Solution
Une migration a été créée pour ajouter ces colonnes.

## Instructions d'application

### Option 1: Via Supabase CLI (Recommandé)
\`\`\`bash
# Sur Linux/Mac
./apply-folderid-migration.sh

# Sur Windows
powershell -ExecutionPolicy Bypass -File apply-folderid-migration.ps1
\`\`\`

### Option 2: Via l'interface Supabase
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans l'onglet "SQL Editor"
4. Copiez et exécutez le contenu du fichier \`${migrationFileName}\`

### Option 3: Via les migrations Supabase
1. Allez dans l'onglet "Database" > "Migrations"
2. Cliquez sur "New migration"
3. Copiez le contenu du fichier \`${migrationFileName}\`
4. Appliquez la migration

## Vérification
Après l'application, testez avec:
\`\`\`bash
node test-folderid-fix.js
\`\`\`

## Fichiers créés
- \`${migrationFileName}\` - Migration SQL
- \`apply-folderid-migration.sh\` - Script d'application (Linux/Mac)
- \`apply-folderid-migration.ps1\` - Script d'application (Windows)
- \`test-folderid-fix.js\` - Script de test
`;

    const readmePath = path.join(__dirname, 'FOLDERID_FIX_README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ README créé: FOLDERID_FIX_README.md');
    
    console.log('\n🎉 === MIGRATION PRÊTE ===');
    console.log('📁 Fichiers créés:');
    console.log(`   - ${migrationFileName}`);
    console.log('   - apply-folderid-migration.sh');
    console.log('   - apply-folderid-migration.ps1');
    console.log('   - FOLDERID_FIX_README.md');
    console.log('\n📝 Instructions:');
    console.log('   1. Exécutez: ./apply-folderid-migration.sh (Linux/Mac)');
    console.log('   2. Ou: powershell -ExecutionPolicy Bypass -File apply-folderid-migration.ps1 (Windows)');
    console.log('   3. Ou: Copiez le SQL dans l\'interface Supabase');
    console.log('   4. Testez avec: node test-folderid-fix.js');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
createAndApplyMigration();
