/**
 * 🐳 Migration via Docker PostgreSQL Supabase
 * 
 * Ce script utilise l'image PostgreSQL Supabase pour exécuter
 * directement les requêtes SQL sur la base de données
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'
import { join } from 'path'
import { writeFileSync } from 'fs'

async function dockerPostgresMigration() {
  console.log('🐳 Migration via Docker PostgreSQL Supabase\n')
  
  try {
    // 1. Charger les variables d'environnement
    const envPath = join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variables d\'environnement Supabase manquantes')
    }
    
    console.log('✅ Configuration Supabase chargée')
    console.log('🌐 URL:', supabaseUrl)
    
    // 2. Extraire les informations de connexion
    const urlParts = supabaseUrl.split('//')[1].split('.')
    const projectRef = urlParts[0]
    
    console.log('🔑 Project Ref:', projectRef)
    
    // 3. Créer le fichier SQL de migration
    const migrationSQL = `
-- Migration pour ajouter les colonnes de fichier à la table documents
-- Générée automatiquement le ${new Date().toISOString()}

-- Ajouter les colonnes de fichier
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- Commentaires sur les nouvelles colonnes
COMMENT ON COLUMN documents.file_name IS 'Nom du fichier uploadé';
COMMENT ON COLUMN documents.file_size IS 'Taille du fichier en bytes';
COMMENT ON COLUMN documents.file_type IS 'Type MIME du fichier';
COMMENT ON COLUMN documents.file_path IS 'Chemin du fichier dans le storage';
COMMENT ON COLUMN documents.url IS 'URL publique du fichier';
COMMENT ON COLUMN documents.tags IS 'Tags associés au document';
COMMENT ON COLUMN documents.is_public IS 'Visibilité du document';

-- Vérifier la structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
`
    
    const sqlFile = join(process.cwd(), 'migration.sql')
    writeFileSync(sqlFile, migrationSQL)
    console.log('📄 Fichier SQL créé:', sqlFile)
    
    // 4. Construire l'URL de connexion PostgreSQL
    // Note: Vous devrez remplacer [YOUR-PASSWORD] par votre mot de passe de base de données
    const dbUrl = `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`
    
    console.log('📊 URL de connexion:', dbUrl)
    console.log('⚠️  Remplacez [YOUR-PASSWORD] par votre mot de passe de base de données')
    
    // 5. Afficher les instructions pour l'exécution manuelle
    console.log('\n📝 INSTRUCTIONS POUR L\'EXÉCUTION:')
    console.log('1. Récupérez votre mot de passe de base de données depuis Supabase Dashboard')
    console.log('2. Remplacez [YOUR-PASSWORD] dans l\'URL ci-dessus')
    console.log('3. Exécutez cette commande:')
    console.log('')
    console.log(`docker run --rm -v "${process.cwd()}:/workspace" -w /workspace supabase/postgres:15.1.0.147 psql "${dbUrl}" -f migration.sql`)
    console.log('')
    
    // 6. Essayer d'exécuter automatiquement si le mot de passe est fourni
    const dbPassword = process.env.SUPABASE_DB_PASSWORD
    if (dbPassword) {
      console.log('🔑 Mot de passe trouvé, tentative d\'exécution automatique...')
      
      const finalDbUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`
      
      try {
        const command = `docker run --rm -v "${process.cwd()}:/workspace" -w /workspace supabase/postgres:15.1.0.147 psql "${finalDbUrl}" -f migration.sql`
        
        console.log('📋 Exécution de la commande...')
        const result = execSync(command, { 
          stdio: 'pipe',
          encoding: 'utf8',
          timeout: 60000 // 60 secondes de timeout
        })
        
        console.log('✅ Migration exécutée avec succès!')
        console.log('📊 Résultat:', result)
        
        // Nettoyer le fichier temporaire
        try {
          execSync(`rm "${sqlFile}"`, { stdio: 'pipe' })
          console.log('🧹 Fichier temporaire nettoyé')
        } catch (cleanupError) {
          console.log('⚠️ Impossible de nettoyer le fichier temporaire')
        }
        
      } catch (execError) {
        console.log('⚠️ Erreur lors de l\'exécution automatique:', execError.message)
        console.log('💡 Exécutez manuellement la commande ci-dessus')
      }
    } else {
      console.log('⚠️ Variable SUPABASE_DB_PASSWORD non trouvée')
      console.log('💡 Ajoutez SUPABASE_DB_PASSWORD dans votre .env.local ou exécutez manuellement')
    }
    
    // 7. Vérifier la structure via l'API Supabase
    console.log('\n📊 Vérification via API Supabase...')
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError)
    } else if (testDoc && testDoc.length > 0) {
      console.log('✅ Structure actuelle:')
      console.log('📋 Colonnes disponibles:', Object.keys(testDoc[0]).join(', '))
      
      const fileColumns = ['file_name', 'file_size', 'file_type', 'file_path', 'url', 'tags', 'is_public']
      const missingColumns = fileColumns.filter(col => !(col in testDoc[0]))
      
      if (missingColumns.length === 0) {
        console.log('🎉 Toutes les colonnes de fichier sont présentes!')
      } else {
        console.log('⚠️ Colonnes manquantes:', missingColumns.join(', '))
      }
    }
    
    console.log('\n🎉 Script terminé!')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
dockerPostgresMigration()
