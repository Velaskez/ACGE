/**
 * Configuration de Vercel avec Supabase
 */

async function setupVercelSupabase() {
  console.log('🚀 Configuration Vercel avec Supabase...\n')

  const supabaseUrl = 'https://wodyrsasfqfoqdydrfew.supabase.co'
  const projectRef = 'wodyrsasfqfoqdydrfew'
  
  // URL PostgreSQL directe pour Supabase (format standard)
  const postgresUrl = `postgresql://postgres.${projectRef}:YOUR_DATABASE_PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`
  
  console.log('📊 Configuration Supabase:')
  console.log(`   - Supabase URL: ${supabaseUrl}`)
  console.log(`   - Project Ref: ${projectRef}`)
  console.log('')
  
  console.log('🔧 DATABASE_URL à utiliser:')
  console.log(`${postgresUrl}`)
  console.log('')
  
  console.log('📝 Étapes pour finaliser:')
  console.log('1. Aller sur le dashboard Supabase:')
  console.log(`   ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/settings/database`)
  console.log('')
  console.log('2. Dans la section "Connection string", copier l\'URL PostgreSQL complète')
  console.log('')
  console.log('3. Ajouter cette URL à Vercel:')
  console.log('   vercel env add DATABASE_URL production')
  console.log('   (coller l\'URL SANS guillemets)')
  console.log('')
  console.log('4. Redéployer:')
  console.log('   vercel --prod')
  console.log('')
  console.log('5. Tester la migration:')
  console.log('   npx tsx scripts/test-migration-final.ts')
  
  // Test de l'API Supabase
  try {
    console.log('\n🧪 Test de l\'API Supabase...')
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4'
      }
    })
    
    console.log(`Status: ${response.status}`)
    if (response.ok || response.status === 200) {
      console.log('✅ Supabase API accessible et fonctionnelle!')
    }
  } catch (error) {
    console.log('⚠️ Erreur API test:', error)
  }
}

setupVercelSupabase()
