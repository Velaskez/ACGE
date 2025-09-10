/**
 * 🔧 Migration simple pour ajouter les colonnes de fichier
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'

async function simpleMigration() {
  console.log('🔧 Migration simple des colonnes de fichier\n')
  
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
    
    // 4. Utiliser l'API REST pour exécuter les requêtes SQL
    console.log('\n📝 Ajout des colonnes via API REST...')
    
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
          console.log('✅ Requête exécutée avec succès')
        } else {
          const errorText = await response.text()
          console.log('⚠️ Erreur:', errorText)
        }
        
      } catch (err) {
        console.log('⚠️ Erreur lors de l\'exécution:', err)
      }
    }
    
    // 5. Vérifier la nouvelle structure
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
    
    console.log('\n🎉 Migration terminée!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Re-uploader un document pour tester')
    console.log('2. Vérifier que l\'aperçu fonctionne')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
simpleMigration()
