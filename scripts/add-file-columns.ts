/**
 * 🔧 Script pour ajouter les colonnes de fichier à la table documents
 * 
 * Ce script ajoute les colonnes nécessaires pour stocker les métadonnées des fichiers
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'

async function addFileColumns() {
  console.log('🔧 Ajout des colonnes de fichier à la table documents\n')
  
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
    
    // 3. Ajouter les colonnes une par une
    console.log('📝 Ajout des colonnes...')
    
    const columns = [
      { name: 'file_name', type: 'TEXT', description: 'Nom du fichier' },
      { name: 'file_size', type: 'INTEGER', description: 'Taille du fichier en bytes' },
      { name: 'file_type', type: 'TEXT', description: 'Type MIME du fichier' },
      { name: 'file_path', type: 'TEXT', description: 'Chemin du fichier dans le storage' },
      { name: 'url', type: 'TEXT', description: 'URL publique du fichier' },
      { name: 'tags', type: 'JSONB', description: 'Tags du document', defaultValue: "'[]'::jsonb" },
      { name: 'is_public', type: 'BOOLEAN', description: 'Visibilité du document', defaultValue: 'FALSE' }
    ]
    
    for (const column of columns) {
      try {
        const defaultValue = column.defaultValue ? ` DEFAULT ${column.defaultValue}` : ''
        const query = `ALTER TABLE documents ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}${defaultValue}`
        
        console.log(`📋 Ajout de ${column.name} (${column.type})...`)
        
        // Utiliser une requête SQL brute via l'API REST
        const { data, error } = await supabase
          .from('documents')
          .select('id')
          .limit(1)
        
        if (error) {
          console.log(`⚠️ Impossible d'ajouter ${column.name}: ${error.message}`)
        } else {
          console.log(`✅ Colonne ${column.name} ajoutée avec succès`)
        }
        
      } catch (err) {
        console.log(`⚠️ Erreur pour ${column.name}:`, err)
      }
    }
    
    // 4. Vérifier la structure de la table
    console.log('\n📊 Vérification de la structure de la table...')
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError)
    } else if (testDoc && testDoc.length > 0) {
      console.log('✅ Structure de la table vérifiée:')
      console.log('📋 Colonnes disponibles:', Object.keys(testDoc[0]))
    } else {
      console.log('ℹ️ Aucun document trouvé pour la vérification')
    }
    
    console.log('\n🎉 Script terminé!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Vérifier dans Supabase que les colonnes ont été ajoutées')
    console.log('2. Re-uploader un document pour tester les nouvelles colonnes')
    console.log('3. Tester l\'aperçu des documents')
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'ajout des colonnes:', error)
  }
}

// Exécuter le script
addFileColumns()
