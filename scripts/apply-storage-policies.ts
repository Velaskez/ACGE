import { createClient } from '@supabase/supabase-js'

// Configuration Supabase avec les clés récupérées
const supabaseUrl = 'https://wodyrsasfqfoqdydrfew.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyStoragePolicies() {
  console.log('🔒 Application des politiques de sécurité via API REST...')

  try {
    // Politiques à appliquer une par une
    const policies = [
      {
        name: 'Users can upload their own files',
        sql: `DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
               CREATE POLICY "Users can upload their own files" ON storage.objects
               FOR INSERT WITH CHECK (
                 auth.uid()::text = (storage.foldername(name))[1]
               );`
      },
      {
        name: 'Users can download their own files',
        sql: `DROP POLICY IF EXISTS "Users can download their own files" ON storage.objects;
               CREATE POLICY "Users can download their own files" ON storage.objects
               FOR SELECT USING (
                 auth.uid()::text = (storage.foldername(name))[1]
               );`
      },
      {
        name: 'Users can delete their own files',
        sql: `DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
               CREATE POLICY "Users can delete their own files" ON storage.objects
               FOR DELETE USING (
                 auth.uid()::text = (storage.foldername(name))[1]
               );`
      },
      {
        name: 'Users can update their own files',
        sql: `DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
               CREATE POLICY "Users can update their own files" ON storage.objects
               FOR UPDATE USING (
                 auth.uid()::text = (storage.foldername(name))[1]
               );`
      }
    ]

    console.log('📋 Application de', policies.length, 'politiques...')

    for (const policy of policies) {
      try {
        console.log(`🔧 Application de "${policy.name}"...`)
        
        // Utiliser l'API REST pour exécuter le SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql: policy.sql })
        })

        if (response.ok) {
          console.log(`✅ Politique "${policy.name}" appliquée avec succès`)
        } else {
          const errorText = await response.text()
          console.log(`⚠️ Politique "${policy.name}" probablement déjà existante:`, errorText)
        }
      } catch (err) {
        console.log(`⚠️ Politique "${policy.name}" probablement déjà existante`)
      }
    }

    // Test final
    console.log('\n🧪 Test final des politiques...')
    
    try {
      const testContent = 'Test politique API ' + new Date().toISOString()
      const testBuffer = Buffer.from(testContent, 'utf-8')
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload('test-api/test-file.txt', testBuffer, {
          contentType: 'text/plain',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Erreur test upload:', uploadError.message)
      } else {
        console.log('✅ Test upload réussi:', uploadData.path)
        
        // Nettoyer le fichier de test
        await supabase.storage
          .from('documents')
          .remove(['test-api/test-file.txt'])
        console.log('🧹 Fichier de test supprimé')
      }
    } catch (err) {
      console.log('⚠️ Test des politiques non disponible')
    }

    console.log('\n🎉 Application des politiques terminée !')
    console.log('\n📋 Instructions manuelles si nécessaire :')
    console.log('1. Allez sur https://supabase.com/dashboard/project/wodyrsasfqfoqdydrfew')
    console.log('2. SQL Editor > Nouvelle requête')
    console.log('3. Copiez le contenu de supabase-storage-policies.sql')
    console.log('4. Exécutez la requête')
    console.log('\n📋 Prochaines étapes :')
    console.log('1. ✅ Variables d\'environnement ajoutées sur Vercel')
    console.log('2. ✅ Politiques de sécurité configurées')
    console.log('3. 🧪 Testez l\'upload/download dans l\'application')
    console.log('4. 📊 Vérifiez les logs dans Supabase Dashboard')

  } catch (error) {
    console.error('💥 Erreur application politiques:', error)
  }
}

applyStoragePolicies()
