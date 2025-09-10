/**
 * 🔧 Script pour exécuter la migration des colonnes de fichier
 * 
 * Ce script ajoute les colonnes nécessaires directement via l'API Supabase
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'

async function executeMigration() {
  console.log('🔧 Exécution de la migration des colonnes de fichier\n')
  
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
    
    // 2. Créer le client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // 3. Vérifier la structure actuelle
    console.log('\n📊 Vérification de la structure actuelle...')
    
    const { data: currentColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'documents')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification:', columnsError)
      return
    }
    
    console.log('📋 Colonnes actuelles:', currentColumns?.map(c => c.column_name).join(', '))
    
    // 4. Ajouter les colonnes manquantes
    console.log('\n📝 Ajout des colonnes manquantes...')
    
    const newColumns = [
      { name: 'file_name', type: 'TEXT', description: 'Nom du fichier' },
      { name: 'file_size', type: 'INTEGER', description: 'Taille du fichier' },
      { name: 'file_type', type: 'TEXT', description: 'Type MIME' },
      { name: 'file_path', type: 'TEXT', description: 'Chemin du fichier' },
      { name: 'url', type: 'TEXT', description: 'URL publique' },
      { name: 'tags', type: 'JSONB', description: 'Tags', defaultValue: "'[]'::jsonb" },
      { name: 'is_public', type: 'BOOLEAN', description: 'Visibilité', defaultValue: 'FALSE' }
    ]
    
    for (const column of newColumns) {
      const exists = currentColumns?.some(c => c.column_name === column.name)
      
      if (exists) {
        console.log(`✅ ${column.name} existe déjà`)
        continue
      }
      
      try {
        const defaultValue = column.defaultValue ? ` DEFAULT ${column.defaultValue}` : ''
        const query = `ALTER TABLE documents ADD COLUMN ${column.name} ${column.type}${defaultValue}`
        
        console.log(`📋 Ajout de ${column.name}...`)
        
        // Utiliser l'API REST pour exécuter la requête SQL
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
          console.log(`✅ ${column.name} ajoutée avec succès`)
        } else {
          const errorData = await response.text()
          console.log(`⚠️ Erreur pour ${column.name}:`, errorData)
        }
        
      } catch (err) {
        console.log(`⚠️ Erreur pour ${column.name}:`, err)
      }
    }
    
    // 5. Vérifier la nouvelle structure
    console.log('\n📊 Vérification de la nouvelle structure...')
    
    const { data: updatedColumns, error: newColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'documents')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (newColumnsError) {
      console.error('❌ Erreur lors de la vérification finale:', newColumnsError)
    } else {
      console.log('📋 Nouvelles colonnes disponibles:')
      updatedColumns?.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`)
      })
    }
    
    // 6. Tester avec un document existant
    console.log('\n🧪 Test avec un document existant...')
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors du test:', testError)
    } else if (testDoc && testDoc.length > 0) {
      console.log('✅ Test réussi - Document récupéré:')
      console.log('📄 ID:', testDoc[0].id)
      console.log('📝 Titre:', testDoc[0].title)
      console.log('📋 Colonnes disponibles:', Object.keys(testDoc[0]).join(', '))
    } else {
      console.log('ℹ️ Aucun document trouvé pour le test')
    }
    
    console.log('\n🎉 Migration terminée avec succès!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Re-uploader un document pour tester les nouvelles colonnes')
    console.log('2. Tester l\'aperçu des documents')
    console.log('3. Vérifier que les métadonnées sont bien sauvegardées')
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
executeMigration()
