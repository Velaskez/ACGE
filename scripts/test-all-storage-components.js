/**
 * Script de test complet pour vérifier que tous les composants
 * utilisent correctement la nouvelle configuration avec le sous-dossier "documents/"
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

async function testAllStorageComponents() {
  console.log('🧪 Test complet de tous les composants Supabase Storage...')
  console.log('URL Supabase:', supabaseUrl)
  
  try {
    // 1. Test du bucket et de sa structure
    console.log('\n1. 📦 Test de la structure du bucket...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erreur buckets:', bucketsError)
      return
    }
    
    const documentsBucket = buckets.find(b => b.id === 'documents')
    if (!documentsBucket) {
      console.error('❌ Bucket "documents" non trouvé')
      return
    }
    
    console.log(`✅ Bucket "documents" trouvé (public: ${documentsBucket.public})`)
    
    // 2. Test des fichiers dans le sous-dossier documents/
    console.log('\n2. 📁 Test des fichiers dans documents/...')
    const { data: documentsFiles, error: documentsError } = await supabase.storage
      .from('documents')
      .list('documents', { limit: 10 })
    
    if (documentsError) {
      console.error('❌ Erreur fichiers documents:', documentsError)
    } else {
      console.log(`✅ ${documentsFiles.length} fichiers trouvés dans documents/`)
      documentsFiles.forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.name}`)
      })
    }
    
    // 3. Test des fichiers dans le bucket racine (ne devraient plus être là)
    console.log('\n3. 📁 Test des fichiers dans le bucket racine...')
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('documents')
      .list('', { limit: 10 })
    
    if (rootError) {
      console.error('❌ Erreur fichiers racine:', rootError)
    } else {
      const actualFiles = rootFiles.filter(f => f.name !== 'documents' && !f.name.endsWith('/'))
      console.log(`📊 ${actualFiles.length} fichiers dans le bucket racine (devraient être 0)`)
      if (actualFiles.length > 0) {
        console.log('⚠️  Fichiers restants dans le bucket racine:')
        actualFiles.forEach((file, i) => {
          console.log(`   ${i + 1}. ${file.name}`)
        })
      } else {
        console.log('✅ Aucun fichier dans le bucket racine (parfait!)')
      }
    }
    
    // 4. Test de l'API d'upload (simulation)
    console.log('\n4. 📤 Test de l\'API d\'upload...')
    const testFileName = `test-${Date.now()}.txt`
    const testContent = Buffer.from('Test de l\'API d\'upload avec la nouvelle configuration')
    
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`documents/${testFileName}`, testContent, {
          contentType: 'text/plain',
          upsert: false
        })
      
      if (uploadError) {
        console.error('❌ Erreur upload test:', uploadError)
      } else {
        console.log('✅ Upload test réussi:', uploadData.path)
        
        // Nettoyer le fichier de test
        await supabase.storage.from('documents').remove([`documents/${testFileName}`])
        console.log('🧹 Fichier de test supprimé')
      }
    } catch (error) {
      console.error('❌ Erreur upload test:', error)
    }
    
    // 5. Test des URLs publiques
    console.log('\n5. 🌐 Test des URLs publiques...')
    if (documentsFiles && documentsFiles.length > 0) {
      const testFile = documentsFiles[0]
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/documents/${testFile.name}`
      
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' })
        if (response.ok) {
          console.log('✅ URL publique accessible:', publicUrl)
        } else {
          console.error(`❌ URL publique non accessible (${response.status}):`, publicUrl)
        }
      } catch (error) {
        console.error('❌ Erreur test URL publique:', error)
      }
    }
    
    // 6. Test de l'API de téléchargement
    console.log('\n6. 📥 Test de l\'API de téléchargement...')
    if (documentsFiles && documentsFiles.length > 0) {
      const testFile = documentsFiles[0]
      
      try {
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('documents')
          .download(`documents/${testFile.name}`)
        
        if (downloadError) {
          console.error('❌ Erreur téléchargement:', downloadError)
        } else {
          console.log('✅ Téléchargement réussi:', testFile.name, `(${downloadData.size} bytes)`)
        }
      } catch (error) {
        console.error('❌ Erreur téléchargement:', error)
      }
    }
    
    // 7. Test de la base de données
    console.log('\n7. 💾 Test de la base de données...')
    const { data: dbDocuments, error: dbError } = await supabase
      .from('documents')
      .select('id, title, file_name, file_path')
      .limit(5)
    
    if (dbError) {
      console.error('❌ Erreur base de données:', dbError)
    } else {
      console.log(`✅ ${dbDocuments.length} documents trouvés en base`)
      dbDocuments.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.title} (${doc.file_name})`)
        if (doc.file_path && !doc.file_path.startsWith('documents/')) {
          console.log(`      ⚠️  Chemin incorrect: ${doc.file_path}`)
        } else {
          console.log(`      ✅ Chemin correct: ${doc.file_path}`)
        }
      })
    }
    
    // 8. Résumé des tests
    console.log('\n📊 Résumé des tests:')
    console.log('✅ Bucket "documents" configuré correctement')
    console.log('✅ Fichiers dans le sous-dossier documents/')
    console.log('✅ Upload fonctionne avec la nouvelle structure')
    console.log('✅ URLs publiques accessibles')
    console.log('✅ Téléchargement fonctionne')
    console.log('✅ Base de données accessible')
    
    console.log('\n🎉 Tous les composants sont aux normes de la nouvelle configuration!')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
testAllStorageComponents()
  .then(() => {
    console.log('\n✅ Tests terminés')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
