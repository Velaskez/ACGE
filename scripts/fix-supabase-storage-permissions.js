/**
 * Script pour vérifier et corriger les permissions du bucket Supabase Storage
 * Ce script aide à diagnostiquer et résoudre les problèmes d'accès aux fichiers
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies dans .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBucketPermissions() {
  console.log('🔍 Vérification des permissions du bucket Supabase Storage...')
  
  try {
    // 1. Vérifier si le bucket 'documents' existe
    console.log('\n1. Vérification de l\'existence du bucket "documents"...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError.message)
      return
    }
    
    const documentsBucket = buckets.find(bucket => bucket.id === 'documents')
    
    if (!documentsBucket) {
      console.error('❌ Le bucket "documents" n\'existe pas')
      console.log('📝 Solution: Créez le bucket "documents" dans Supabase Storage')
      return
    }
    
    console.log('✅ Bucket "documents" trouvé')
    console.log('   - Nom:', documentsBucket.name)
    console.log('   - Public:', documentsBucket.public)
    console.log('   - Créé le:', documentsBucket.created_at)
    
    // 2. Vérifier les fichiers dans le bucket
    console.log('\n2. Vérification des fichiers dans le bucket...')
    const { data: files, error: filesError } = await supabase.storage
      .from('documents')
      .list('', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Erreur lors de la récupération des fichiers:', filesError.message)
      return
    }
    
    console.log(`✅ ${files.length} fichiers trouvés dans le bucket`)
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size || 'Taille inconnue'} bytes)`)
    })
    
    // 3. Tester l'accès à un fichier
    if (files.length > 0) {
      console.log('\n3. Test d\'accès à un fichier...')
      const testFile = files[0]
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(testFile.name)
      
      if (fileError) {
        console.error('❌ Erreur lors du téléchargement du fichier:', fileError.message)
        console.log('📝 Solution: Vérifiez les politiques RLS du bucket')
      } else {
        console.log('✅ Fichier accessible via l\'API Supabase')
      }
      
      // 4. Tester l'URL publique
      console.log('\n4. Test de l\'URL publique...')
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/documents/${testFile.name}`
      console.log('URL publique:', publicUrl)
      
      try {
        const response = await fetch(publicUrl, { method: 'HEAD' })
        if (response.ok) {
          console.log('✅ URL publique accessible')
        } else {
          console.error(`❌ URL publique non accessible (${response.status}: ${response.statusText})`)
          console.log('📝 Solution: Vérifiez que le bucket est public et que les politiques RLS permettent l\'accès')
        }
      } catch (fetchError) {
        console.error('❌ Erreur lors du test de l\'URL publique:', fetchError.message)
      }
    }
    
    // 5. Afficher les recommandations
    console.log('\n📋 Recommandations:')
    console.log('1. Assurez-vous que le bucket "documents" est marqué comme public')
    console.log('2. Vérifiez les politiques RLS dans Supabase Dashboard > Storage > Policies')
    console.log('3. Créez une politique publique pour le bucket:')
    console.log(`
   CREATE POLICY "Public Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'documents');
   `)
    console.log('4. Vérifiez que les fichiers sont uploadés avec les bonnes permissions')
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter le script
checkBucketPermissions()
  .then(() => {
    console.log('\n✅ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
