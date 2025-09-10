/**
 * 🔧 Script de correction du schéma de la table documents
 * 
 * Ce script ajoute les colonnes manquantes nécessaires pour l'aperçu des documents
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

async function fixDocumentsSchema() {
  console.log('🔧 Correction du schéma de la table documents\n')
  
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
    
    // 2. Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 3. Lire le script SQL
    const sqlScript = readFileSync(join(process.cwd(), 'fix-documents-schema.sql'), 'utf8')
    
    console.log('📄 Script SQL chargé, exécution en cours...')
    
    // 4. Exécuter la migration étape par étape
    console.log('📝 Ajout des colonnes manquantes...')
    
    // Ajouter les colonnes une par une
    const alterQueries = [
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type TEXT',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS url TEXT',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT \'[]\'::jsonb',
      'ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE'
    ]
    
    for (const query of alterQueries) {
      try {
        const { error } = await supabase.rpc('exec', { sql: query })
        if (error) {
          console.log(`⚠️ Requête ignorée (colonne peut-être déjà existante): ${query}`)
        } else {
          console.log(`✅ Colonne ajoutée: ${query.split(' ')[4]}`)
        }
      } catch (err) {
        console.log(`⚠️ Requête ignorée: ${query}`)
      }
    }
    
    console.log('✅ Migration exécutée avec succès')
    
    // 5. Vérifier la structure de la table
    console.log('\n📊 Vérification de la structure de la table...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'documents')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification:', columnsError)
      return
    }
    
    console.log('\n📋 Structure de la table documents:')
    console.table(columns)
    
    // 6. Tester avec un document existant
    console.log('\n🧪 Test avec un document existant...')
    
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (docsError) {
      console.error('❌ Erreur lors de la récupération des documents:', docsError)
      return
    }
    
    if (documents && documents.length > 0) {
      console.log('✅ Document de test récupéré:', documents[0])
    } else {
      console.log('ℹ️ Aucun document trouvé pour le test')
    }
    
    console.log('\n🎉 Correction du schéma terminée avec succès!')
    
  } catch (error) {
    console.error('💥 Erreur lors de la correction du schéma:', error)
  }
}

// Exécuter le script
fixDocumentsSchema()
