/**
 * Script pour corriger les chemins de fichiers dans la base de données
 * et les mettre à jour pour utiliser le sous-dossier "documents/"
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixDatabaseFilePaths() {
  console.log('🔧 Correction des chemins de fichiers dans la base de données...')
  console.log('URL Supabase:', supabaseUrl)
  
  try {
    // 1. Récupérer tous les documents avec des chemins incorrects
    console.log('\n1. 📋 Récupération des documents...')
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, file_name, file_path')
      .not('file_path', 'like', 'documents/%')
    
    if (fetchError) {
      console.error('❌ Erreur récupération documents:', fetchError)
      return
    }
    
    console.log(`📊 ${documents.length} documents à corriger`)
    
    if (documents.length === 0) {
      console.log('✅ Aucun document à corriger')
      return
    }
    
    // 2. Corriger chaque document
    console.log('\n2. 🔧 Correction des chemins...')
    let corrected = 0
    let errors = 0
    
    for (const doc of documents) {
      try {
        const newFilePath = `documents/${doc.file_name}`
        
        console.log(`📝 Correction: ${doc.title}`)
        console.log(`   Ancien chemin: ${doc.file_path}`)
        console.log(`   Nouveau chemin: ${newFilePath}`)
        
        const { error: updateError } = await supabase
          .from('documents')
          .update({ 
            file_path: newFilePath,
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.id)
        
        if (updateError) {
          console.error(`❌ Erreur correction ${doc.title}:`, updateError)
          errors++
        } else {
          console.log(`✅ Corrigé: ${doc.title}`)
          corrected++
        }
        
      } catch (error) {
        console.error(`❌ Erreur traitement ${doc.title}:`, error)
        errors++
      }
    }
    
    // 3. Vérification finale
    console.log('\n3. ✅ Vérification finale...')
    const { data: updatedDocs, error: verifyError } = await supabase
      .from('documents')
      .select('id, title, file_path')
      .not('file_path', 'like', 'documents/%')
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError)
    } else {
      console.log(`📊 ${updatedDocs.length} documents restants avec des chemins incorrects`)
      if (updatedDocs.length > 0) {
        console.log('⚠️  Documents non corrigés:')
        updatedDocs.forEach(doc => {
          console.log(`   - ${doc.title}: ${doc.file_path}`)
        })
      } else {
        console.log('✅ Tous les chemins sont maintenant corrects!')
      }
    }
    
    // 4. Résumé
    console.log('\n📊 Résumé de la correction:')
    console.log(`✅ Documents corrigés: ${corrected}`)
    console.log(`❌ Erreurs: ${errors}`)
    console.log(`📋 Total traité: ${documents.length}`)
    
    if (corrected > 0) {
      console.log('\n🎉 Correction terminée avec succès!')
      console.log('💡 Les composants de prévisualisation devraient maintenant fonctionner correctement.')
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
fixDatabaseFilePaths()
  .then(() => {
    console.log('\n✅ Script terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
