/**
 * Script de test avancé pour diagnostiquer les problèmes d'accès Supabase Storage
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

async function testStorageAccess() {
  console.log('🔍 Test avancé d\'accès Supabase Storage...')
  console.log('URL Supabase:', supabaseUrl)
  console.log('Clé anonyme:', supabaseKey.substring(0, 20) + '...')
  
  try {
    // 1. Lister les buckets
    console.log('\n1. 📦 Vérification des buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erreur buckets:', bucketsError)
      return
    }
    
    console.log('Buckets disponibles:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.id} (public: ${bucket.public})`)
    })
    
    // 2. Vérifier le bucket documents
    const documentsBucket = buckets.find(b => b.id === 'documents')
    if (!documentsBucket) {
      console.error('❌ Bucket "documents" non trouvé')
      return
    }
    
    console.log(`\n✅ Bucket "documents" trouvé (public: ${documentsBucket.public})`)
    
    // 3. Lister les fichiers dans le bucket racine
    console.log('\n2. 📁 Fichiers dans le bucket racine...')
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list('', { limit: 5 })
    
    // 3b. Lister les fichiers dans le sous-dossier "documents"
    console.log('\n2b. 📁 Fichiers dans le sous-dossier "documents"...')
    const { data: documentsFiles, error: documentsFilesError } = await supabase.storage
      .from('documents')
      .list('documents', { limit: 5 })
    
    if (filesError) {
      console.error('❌ Erreur fichiers racine:', filesError)
    } else {
      console.log(`Fichiers dans le bucket racine: ${files.length}`)
      files.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name}`)
      })
    }
    
    if (documentsFilesError) {
      console.error('❌ Erreur fichiers documents:', documentsFilesError)
    } else {
      console.log(`Fichiers dans le sous-dossier "documents": ${documentsFiles.length}`)
      documentsFiles.forEach((file, i) => {
        console.log(`  ${i + 1}. ${file.name}`)
      })
    }
    
    // Utiliser les fichiers du sous-dossier "documents" s'ils existent, sinon ceux du racine
    const testFiles = documentsFiles && documentsFiles.length > 0 ? documentsFiles : files
    
    // 4. Tester l'accès via l'API Supabase
    if (testFiles.length > 0) {
      const testFile = testFiles[0]
      const filePath = documentsFiles && documentsFiles.length > 0 ? `documents/${testFile.name}` : testFile.name
      console.log(`\n3. 🔗 Test d'accès API pour: ${filePath}`)
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(filePath)
      
      if (downloadError) {
        console.error('❌ Erreur téléchargement API:', downloadError)
      } else {
        console.log('✅ Téléchargement API réussi')
        console.log('   Taille du fichier:', fileData.size, 'bytes')
      }
    }
    
    // 5. Tester l'URL publique
    if (testFiles.length > 0) {
      const testFile = testFiles[0]
      const filePath = documentsFiles && documentsFiles.length > 0 ? `documents/${testFile.name}` : testFile.name
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${filePath}`
      
      console.log(`\n4. 🌐 Test URL publique: ${publicUrl}`)
      
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' })
        console.log('   Status:', response.status, response.statusText)
        console.log('   Headers:', Object.fromEntries(response.headers.entries()))
        
        if (response.ok) {
          console.log('✅ URL publique accessible')
        } else {
          console.error('❌ URL publique non accessible')
          
          // Essayer avec GET pour plus de détails
          console.log('\n5. 🔍 Test GET pour plus de détails...')
          const getResponse = await fetch(publicUrl, { method: 'GET' })
          console.log('   GET Status:', getResponse.status, getResponse.statusText)
          
          if (getResponse.status === 403) {
            console.log('\n📋 Solutions pour erreur 403:')
            console.log('1. Vérifiez que le bucket est marqué comme public dans Supabase Dashboard')
            console.log('2. Vérifiez les politiques RLS:')
            console.log('   - Allez dans Supabase Dashboard > Storage > Policies')
            console.log('   - Assurez-vous qu\'il y a une politique "Public Access"')
            console.log('3. Vérifiez que la politique est active et correcte')
          }
        }
      } catch (fetchError) {
        console.error('❌ Erreur fetch:', fetchError.message)
      }
    }
    
    // 6. Tester avec un fichier spécifique (si fourni en argument)
    const specificFile = process.argv[2]
    if (specificFile) {
      console.log(`\n6. 🎯 Test fichier spécifique: ${specificFile}`)
      const specificUrl = `${supabaseUrl}/storage/v1/object/public/documents/${specificFile}`
      
      try {
        const response = await fetch(specificUrl, { method: 'HEAD' })
        console.log('   Status:', response.status, response.statusText)
        
        if (response.ok) {
          console.log('✅ Fichier spécifique accessible')
        } else {
          console.error('❌ Fichier spécifique non accessible')
        }
      } catch (error) {
        console.error('❌ Erreur fichier spécifique:', error.message)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le script
testStorageAccess()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
