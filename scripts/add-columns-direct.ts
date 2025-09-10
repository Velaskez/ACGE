/**
 * 🔧 Ajout direct des colonnes manquantes
 * 
 * Ce script utilise l'API Supabase pour ajouter directement
 * les colonnes manquantes à la table documents
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'

async function addColumnsDirect() {
  console.log('🔧 Ajout direct des colonnes manquantes\n')
  
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
    
    // 2. Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 3. Vérifier la structure actuelle
    console.log('\n📊 Vérification de la structure actuelle...')
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError)
      return
    }
    
    if (testDoc && testDoc.length > 0) {
      console.log('📋 Colonnes actuelles:', Object.keys(testDoc[0]).join(', '))
      
      // Vérifier si les colonnes de fichier existent déjà
      const hasFileColumns = ['file_name', 'file_size', 'file_type', 'file_path'].every(
        col => col in testDoc[0]
      )
      
      if (hasFileColumns) {
        console.log('✅ Les colonnes de fichier existent déjà!')
        return
      }
    }
    
    // 4. Créer d'abord la fonction exec_sql si elle n'existe pas
    console.log('\n📝 Création de la fonction exec_sql...')
    
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
    
    // 5. Ajouter les colonnes une par une
    console.log('\n📝 Ajout des colonnes de fichier...')
    
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
          console.log('✅ Colonne ajoutée')
        } else {
          const errorText = await response.text()
          console.log('⚠️ Erreur:', errorText)
        }
        
      } catch (err) {
        console.log('⚠️ Erreur requête:', err)
      }
    }
    
    // 6. Créer les index pour les performances
    console.log('\n📊 Création des index de performance...')
    
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type)',
      'CREATE INDEX IF NOT EXISTS idx_documents_file_size ON documents(file_size)',
      'CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public)',
      'CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags)'
    ]
    
    for (const query of indexQueries) {
      try {
        console.log(`📋 Index: ${query}`)
        
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
          console.log('✅ Index créé')
        } else {
          const errorText = await response.text()
          console.log('⚠️ Erreur index:', errorText)
        }
        
      } catch (err) {
        console.log('⚠️ Erreur index:', err)
      }
    }
    
    // 7. Vérifier la structure finale
    console.log('\n📊 Vérification de la structure finale...')
    
    const { data: finalTest, error: finalError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError)
    } else if (finalTest && finalTest.length > 0) {
      console.log('✅ Structure mise à jour:')
      console.log('📋 Nouvelles colonnes:', Object.keys(finalTest[0]).join(', '))
      
      // Vérifier les colonnes de fichier
      const fileColumns = ['file_name', 'file_size', 'file_type', 'file_path', 'url', 'tags', 'is_public']
      const missingColumns = fileColumns.filter(col => !(col in finalTest[0]))
      
      if (missingColumns.length === 0) {
        console.log('🎉 Toutes les colonnes de fichier ont été ajoutées!')
        console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS!')
        console.log('📝 Prochaines étapes:')
        console.log('1. Re-uploader un document pour tester')
        console.log('2. Vérifier que l\'aperçu fonctionne')
      } else {
        console.log('⚠️ Colonnes manquantes:', missingColumns.join(', '))
        console.log('\n💡 SOLUTION MANUELLE:')
        console.log('1. Allez dans votre Supabase Dashboard')
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
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'ajout des colonnes:', error)
  }
}

// Exécuter l'ajout des colonnes
addColumnsDirect()
