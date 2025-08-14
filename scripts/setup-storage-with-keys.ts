import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec les clés récupérées
const supabaseUrl = 'https://wodyrsasfqfoqdydrfew.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  console.log('🚀 Configuration Supabase Storage...')

  try {
    // 1. Créer le bucket "documents"
    console.log('📦 Création du bucket "documents"...')
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('documents', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['*/*']
    })

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "documents" existe déjà')
      } else {
        console.error('❌ Erreur création bucket:', bucketError)
        return
      }
    } else {
      console.log('✅ Bucket "documents" créé avec succès')
    }

    // 2. Configurer les politiques de sécurité via SQL
    console.log('🔒 Configuration des politiques de sécurité...')
    
    const policies = [
      {
        name: 'Users can upload their own files',
        sql: `
          CREATE POLICY "Users can upload their own files" ON storage.objects
          FOR INSERT WITH CHECK (
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can download their own files',
        sql: `
          CREATE POLICY "Users can download their own files" ON storage.objects
          FOR SELECT USING (
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can delete their own files',
        sql: `
          CREATE POLICY "Users can delete their own files" ON storage.objects
          FOR DELETE USING (
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ]

    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ Politique "${policy.name}" existe déjà`)
          } else {
            console.error(`❌ Erreur politique "${policy.name}":`, error.message)
          }
        } else {
          console.log(`✅ Politique "${policy.name}" créée`)
        }
      } catch (err) {
        console.log(`⚠️ Politique "${policy.name}" probablement déjà existante`)
      }
    }

    // 3. Tester l'upload
    console.log('🧪 Test d\'upload...')
    const testContent = 'Test Supabase Storage ' + new Date().toISOString()
    const testBuffer = Buffer.from(testContent, 'utf-8')
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload('test/test-file.txt', testBuffer, {
        contentType: 'text/plain',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Erreur test upload:', uploadError)
    } else {
      console.log('✅ Test upload réussi:', uploadData.path)
      
      // Nettoyer le fichier de test
      await supabase.storage
        .from('documents')
        .remove(['test/test-file.txt'])
      console.log('🧹 Fichier de test supprimé')
    }

    console.log('\n🎉 Configuration Supabase Storage terminée !')
    console.log('\n📋 Variables d\'environnement à ajouter :')
    console.log('NEXT_PUBLIC_SUPABASE_URL="https://wodyrsasfqfoqdydrfew.supabase.co"')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4"')
    console.log('SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0"')

  } catch (error) {
    console.error('💥 Erreur configuration:', error)
  }
}

setupStorage()
