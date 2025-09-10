/**
 * 🔧 Migration Supabase via Docker
 * 
 * Ce script utilise Docker pour exécuter le Supabase CLI
 * et créer/appliquer les migrations directement
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

async function supabaseDockerMigration() {
  console.log('🐳 Migration Supabase via Docker\n')
  
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
    
    // 2. Vérifier que Docker est disponible
    try {
      execSync('docker --version', { stdio: 'pipe' })
      console.log('✅ Docker disponible')
    } catch {
      throw new Error('Docker n\'est pas installé ou non disponible')
    }
    
    // 3. Créer le dossier supabase s'il n'existe pas
    const supabaseDir = join(process.cwd(), 'supabase')
    if (!existsSync(supabaseDir)) {
      mkdirSync(supabaseDir, { recursive: true })
      console.log('📁 Dossier supabase créé')
    }
    
    // 4. Créer le fichier de migration
    const migrationContent = `-- Migration pour ajouter les colonnes de fichier à la table documents
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
`
    
    const migrationDir = join(supabaseDir, 'migrations')
    if (!existsSync(migrationDir)) {
      mkdirSync(migrationDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const migrationFile = join(migrationDir, `${timestamp}_add_file_columns.sql`)
    
    writeFileSync(migrationFile, migrationContent)
    console.log('📄 Fichier de migration créé:', migrationFile)
    
    // 5. Créer le fichier de configuration Supabase
    const configContent = `version: 1
project_id: ${supabaseUrl.split('//')[1].split('.')[0]}
`
    
    const configFile = join(supabaseDir, 'config.toml')
    if (!existsSync(configFile)) {
      writeFileSync(configFile, configContent)
      console.log('⚙️ Fichier de configuration créé')
    }
    
    // 6. Exécuter la migration via Docker
    console.log('\n🚀 Exécution de la migration via Docker...')
    
    try {
      // Utiliser le conteneur Supabase CLI
      const dockerCommand = `docker run --rm -v "${process.cwd()}:/workspace" -w /workspace supabase/cli:latest db push --db-url "${supabaseUrl.replace('https://', 'postgresql://postgres:')}@${supabaseUrl.split('//')[1].split('.')[0]}.supabase.co:5432/postgres"`
      
      console.log('📋 Commande Docker:', dockerCommand)
      
      const result = execSync(dockerCommand, { 
        stdio: 'pipe',
        encoding: 'utf8'
      })
      
      console.log('✅ Migration exécutée avec succès!')
      console.log('📊 Résultat:', result)
      
    } catch (dockerError) {
      console.log('⚠️ Erreur Docker, tentative alternative...')
      
      // Alternative: Exécuter directement les requêtes SQL via l'API
      console.log('🔄 Exécution directe des requêtes SQL...')
      
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      const queries = [
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT \'[]\'::jsonb',
        'ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE'
      ]
      
      for (const query of queries) {
        try {
          console.log(`📋 Exécution: ${query}`)
          
          // Utiliser l'API REST pour exécuter la requête
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': supabaseServiceKey
            },
            body: JSON.stringify({ sql: query })
          })
          
          if (response.ok) {
            console.log('✅ Requête exécutée')
          } else {
            const errorText = await response.text()
            console.log('⚠️ Erreur:', errorText)
          }
          
        } catch (err) {
          console.log('⚠️ Erreur requête:', err)
        }
      }
    }
    
    // 7. Vérifier la structure finale
    console.log('\n📊 Vérification de la structure finale...')
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError)
    } else if (testDoc && testDoc.length > 0) {
      console.log('✅ Structure mise à jour:')
      console.log('📋 Colonnes disponibles:', Object.keys(testDoc[0]).join(', '))
      
      const fileColumns = ['file_name', 'file_size', 'file_type', 'file_path', 'url', 'tags', 'is_public']
      const missingColumns = fileColumns.filter(col => !(col in testDoc[0]))
      
      if (missingColumns.length === 0) {
        console.log('🎉 Toutes les colonnes de fichier ont été ajoutées!')
      } else {
        console.log('⚠️ Colonnes manquantes:', missingColumns.join(', '))
      }
    }
    
    console.log('\n🎉 Migration terminée!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Re-uploader un document pour tester')
    console.log('2. Vérifier que l\'aperçu fonctionne')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
supabaseDockerMigration()
