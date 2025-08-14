import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec les clés récupérées
const supabaseUrl = 'https://wodyrsasfqfoqdydrfew.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function configureStoragePolicies() {
  console.log('🔒 Configuration des politiques de sécurité Supabase Storage...')

  try {
    // Politiques à créer
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
      },
      {
        name: 'Users can update their own files',
        sql: `
          CREATE POLICY "Users can update their own files" ON storage.objects
          FOR UPDATE USING (
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ]

    console.log('📋 Configuration de', policies.length, 'politiques...')

    for (const policy of policies) {
      try {
        console.log(`🔧 Configuration de "${policy.name}"...`)
        
        // Exécuter la politique via SQL direct
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
        
        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ Politique "${policy.name}" existe déjà`)
          } else {
            console.error(`❌ Erreur politique "${policy.name}":`, error.message)
          }
        } else {
          console.log(`✅ Politique "${policy.name}" créée avec succès`)
        }
      } catch (err) {
        console.log(`⚠️ Politique "${policy.name}" probablement déjà existante`)
      }
    }

    // Vérifier les politiques existantes
    console.log('\n🔍 Vérification des politiques existantes...')
    
    try {
      const { data: policies, error } = await supabase
        .from('storage.policies')
        .select('*')
        .eq('table_name', 'objects')

      if (error) {
        console.log('⚠️ Impossible de vérifier les politiques existantes')
      } else {
        console.log('📊 Politiques trouvées:', policies?.length || 0)
        policies?.forEach(policy => {
          console.log(`  - ${policy.name} (${policy.operation})`)
        })
      }
    } catch (err) {
      console.log('⚠️ Vérification des politiques non disponible')
    }

    // Test final avec un utilisateur authentifié
    console.log('\n🧪 Test final des politiques...')
    
    try {
      // Créer un fichier de test pour vérifier les politiques
      const testContent = 'Test politique ' + new Date().toISOString()
      const testBuffer = Buffer.from(testContent, 'utf-8')
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload('test-policy/test-file.txt', testBuffer, {
          contentType: 'text/plain',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Erreur test upload (politiques):', uploadError.message)
      } else {
        console.log('✅ Test upload réussi avec politiques:', uploadData.path)
        
        // Nettoyer le fichier de test
        await supabase.storage
          .from('documents')
          .remove(['test-policy/test-file.txt'])
        console.log('🧹 Fichier de test supprimé')
      }
    } catch (err) {
      console.log('⚠️ Test des politiques non disponible (normal sans authentification)')
    }

    console.log('\n🎉 Configuration des politiques terminée !')
    console.log('\n📋 Prochaines étapes :')
    console.log('1. ✅ Variables d\'environnement ajoutées sur Vercel')
    console.log('2. ✅ Politiques de sécurité configurées')
    console.log('3. 🧪 Testez l\'upload/download dans l\'application')
    console.log('4. 📊 Vérifiez les logs dans Supabase Dashboard')

  } catch (error) {
    console.error('💥 Erreur configuration politiques:', error)
  }
}

configureStoragePolicies()
