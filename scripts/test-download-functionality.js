/**
 * Script de test pour vérifier que la fonctionnalité de téléchargement fonctionne
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

async function testDownloadFunctionality() {
  console.log('🧪 Test de la fonctionnalité de téléchargement...')
  console.log('URL Supabase:', supabaseUrl)
  
  try {
    // 1. Récupérer un document de test
    console.log('\n1. 📋 Récupération d\'un document de test...')
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, title, file_name, file_path')
      .limit(1)
    
    if (docError || !documents || documents.length === 0) {
      console.error('❌ Aucun document trouvé pour le test')
      return
    }
    
    const testDocument = documents[0]
    console.log(`✅ Document de test: ${testDocument.title}`)
    console.log(`   ID: ${testDocument.id}`)
    console.log(`   Fichier: ${testDocument.file_name}`)
    console.log(`   Chemin: ${testDocument.file_path}`)
    
    // 2. Test de l'API de téléchargement
    console.log('\n2. 📥 Test de l\'API de téléchargement...')
    const apiUrl = `http://localhost:3000/api/files/${testDocument.id}`
    
    try {
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length')
        const contentType = response.headers.get('content-type')
        
        console.log('✅ API de téléchargement accessible')
        console.log(`   Status: ${response.status}`)
        console.log(`   Content-Type: ${contentType}`)
        console.log(`   Content-Length: ${contentLength} bytes`)
        
        // Tester le téléchargement du blob
        const blob = await response.blob()
        console.log(`✅ Blob téléchargé: ${blob.size} bytes`)
        console.log(`   Type: ${blob.type}`)
        
      } else {
        console.error(`❌ Erreur API téléchargement: ${response.status}`)
        const errorText = await response.text()
        console.error(`   Détails: ${errorText}`)
      }
      
    } catch (fetchError) {
      console.error('❌ Erreur fetch:', fetchError.message)
      console.log('💡 Assurez-vous que le serveur de développement est démarré (npm run dev)')
    }
    
    // 3. Test de l'URL publique Supabase
    console.log('\n3. 🌐 Test de l\'URL publique Supabase...')
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${testDocument.file_path}`
    console.log(`URL publique: ${publicUrl}`)
    
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' })
      
      if (response.ok) {
        console.log('✅ URL publique accessible')
        console.log(`   Status: ${response.status}`)
        console.log(`   Content-Type: ${response.headers.get('content-type')}`)
        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`)
      } else {
        console.error(`❌ URL publique non accessible: ${response.status}`)
      }
      
    } catch (error) {
      console.error('❌ Erreur URL publique:', error.message)
    }
    
    // 4. Test de téléchargement direct depuis Supabase
    console.log('\n4. 📥 Test de téléchargement direct depuis Supabase...')
    try {
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(testDocument.file_path)
      
      if (downloadError) {
        console.error('❌ Erreur téléchargement Supabase:', downloadError)
      } else {
        console.log('✅ Téléchargement Supabase réussi')
        console.log(`   Taille: ${downloadData.size} bytes`)
        console.log(`   Type: ${downloadData.type}`)
      }
      
    } catch (error) {
      console.error('❌ Erreur téléchargement Supabase:', error)
    }
    
    // 5. Résumé des tests
    console.log('\n📊 Résumé des tests de téléchargement:')
    console.log('✅ Document de test trouvé')
    console.log('✅ API de téléchargement testée')
    console.log('✅ URL publique testée')
    console.log('✅ Téléchargement Supabase testé')
    
    console.log('\n💡 Pour tester dans l\'interface:')
    console.log('1. Démarrez le serveur: npm run dev')
    console.log('2. Ouvrez http://localhost:3000')
    console.log('3. Cliquez sur l\'icône "Eye" d\'un document')
    console.log('4. Cliquez sur "Télécharger" dans la modal')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
testDownloadFunctionality()
  .then(() => {
    console.log('\n✅ Tests de téléchargement terminés')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
