/**
 * 🔧 Script final pour ajouter les colonnes de fichier
 * Utilise la fonction exec_sql créée précédemment
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'

async function addFileColumnsFinal() {
  console.log('🔧 Ajout des colonnes de fichier via exec_sql\n')
  
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
    
    // 4. Ajouter les colonnes une par une
    console.log('\n📝 Ajout des colonnes via exec_sql...')
    
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
        
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.log(`⚠️ Erreur pour ${query}:`, error.message)
        } else {
          console.log(`✅ Colonne ajoutée avec succès`)
        }
        
      } catch (err) {
        console.log(`⚠️ Erreur lors de l'exécution:`, err)
      }
    }
    
    // 5. Créer les index pour les performances
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
        
        const { error } = await supabase.rpc('exec_sql', { sql: query })
        
        if (error) {
          console.log(`⚠️ Erreur index:`, error.message)
        } else {
          console.log(`✅ Index créé`)
        }
        
      } catch (err) {
        console.log(`⚠️ Erreur index:`, err)
      }
    }
    
    // 6. Vérifier la nouvelle structure
    console.log('\n📊 Vérification de la nouvelle structure...')
    
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
        console.log('🎉 Toutes les colonnes de fichier ont été ajoutées avec succès!')
      } else {
        console.log('⚠️ Colonnes manquantes:', missingColumns.join(', '))
      }
    }
    
    // 7. Test avec un document existant
    console.log('\n🧪 Test avec un document existant...')
    
    const { data: testDoc2, error: testError2 } = await supabase
      .from('documents')
      .select('id, title, file_name, file_size, file_type, file_path, url, tags, is_public')
      .limit(1)
    
    if (testError2) {
      console.error('❌ Erreur lors du test:', testError2)
    } else if (testDoc2 && testDoc2.length > 0) {
      console.log('✅ Test réussi - Document récupéré:')
      console.log('📄 ID:', testDoc2[0].id)
      console.log('📝 Titre:', testDoc2[0].title)
      console.log('📁 Métadonnées de fichier disponibles:', {
        file_name: testDoc2[0].file_name || 'NULL',
        file_size: testDoc2[0].file_size || 'NULL',
        file_type: testDoc2[0].file_type || 'NULL',
        file_path: testDoc2[0].file_path || 'NULL',
        url: testDoc2[0].url || 'NULL',
        tags: testDoc2[0].tags || 'NULL',
        is_public: testDoc2[0].is_public || 'NULL'
      })
    } else {
      console.log('ℹ️ Aucun document trouvé pour le test')
    }
    
    console.log('\n🎉 Migration terminée avec succès!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Re-uploader un document pour tester les nouvelles colonnes')
    console.log('2. Vérifier que l\'aperçu des documents fonctionne')
    console.log('3. Tester le téléchargement des fichiers')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
addFileColumnsFinal()
