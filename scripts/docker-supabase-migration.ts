/**
 * 🐳 Migration Supabase via Docker CLI
 * 
 * Ce script utilise Docker pour exécuter le Supabase CLI
 * et appliquer les migrations directement sur la base Supabase
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'
import { join } from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

async function dockerSupabaseMigration() {
  console.log('🐳 Migration Supabase via Docker CLI\n')
  
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
    
    // 2. Vérifier que Docker fonctionne
    try {
      execSync('docker --version', { stdio: 'pipe' })
      console.log('✅ Docker disponible')
    } catch {
      throw new Error('Docker n\'est pas disponible')
    }
    
    // 3. Créer le dossier supabase et la migration
    const supabaseDir = join(process.cwd(), 'supabase')
    if (!existsSync(supabaseDir)) {
      mkdirSync(supabaseDir, { recursive: true })
      console.log('📁 Dossier supabase créé')
    }
    
    const migrationDir = join(supabaseDir, 'migrations')
    if (!existsSync(migrationDir)) {
      mkdirSync(migrationDir, { recursive: true })
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
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const migrationFile = join(migrationDir, `${timestamp}_add_file_columns.sql`)
    
    writeFileSync(migrationFile, migrationContent)
    console.log('📄 Fichier de migration créé:', migrationFile)
    
    // 5. Extraire les informations de connexion depuis l'URL Supabase
    const urlParts = supabaseUrl.split('//')[1].split('.')
    const projectRef = urlParts[0]
    const dbUrl = `postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`
    
    console.log('🔑 Project Ref:', projectRef)
    console.log('📊 DB URL template:', dbUrl)
    
    // 6. Essayer d'exécuter la migration via Docker
    console.log('\n🚀 Exécution de la migration via Docker Supabase CLI...')
    
    try {
      // Commande Docker pour exécuter le Supabase CLI
      const dockerCommand = `docker run --rm -v "${process.cwd()}:/workspace" -w /workspace supabase/cli:latest db push --db-url "${dbUrl}"`
      
      console.log('📋 Commande Docker:', dockerCommand)
      
      const result = execSync(dockerCommand, { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 30000 // 30 secondes de timeout
      })
      
      console.log('✅ Migration exécutée avec succès!')
      console.log('📊 Résultat:', result)
      
    } catch (dockerError) {
      console.log('⚠️ Erreur Docker, tentative alternative...')
      console.log('💡 Erreur:', dockerError.message)
      
      // Alternative: Utiliser l'API REST de Supabase
      console.log('\n🔄 Tentative via API REST Supabase...')
      
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Essayer de créer la fonction exec_sql d'abord
      console.log('📝 Création de la fonction exec_sql...')
      
      const createFunctionSQL = `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
      `
      
      try {
        // Utiliser l'API REST pour créer la fonction
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: createFunctionSQL })
        })
        
        if (response.ok) {
          console.log('✅ Fonction exec_sql créée')
        } else {
          console.log('⚠️ Fonction exec_sql peut-être déjà existante')
        }
      } catch (err) {
        console.log('⚠️ Erreur création fonction:', err)
      }
      
      // Maintenant exécuter les requêtes de migration
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
        console.log('\n📝 Instructions manuelles:')
        console.log('1. Allez dans votre projet Supabase Dashboard')
        console.log('2. Ouvrez l\'éditeur SQL')
        console.log('3. Exécutez ces requêtes:')
        missingColumns.forEach(col => {
          const type = col === 'file_size' ? 'INTEGER' : 
                      col === 'tags' ? 'JSONB DEFAULT \'[]\'::jsonb' :
                      col === 'is_public' ? 'BOOLEAN DEFAULT FALSE' : 'TEXT'
          console.log(`   ALTER TABLE documents ADD COLUMN IF NOT EXISTS ${col} ${type};`)
        })
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
dockerSupabaseMigration()
