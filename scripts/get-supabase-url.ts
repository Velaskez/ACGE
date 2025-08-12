/**
 * Récupérer l'URL de connexion Supabase
 */

async function getSupabaseUrl() {
  console.log('🔗 Récupération de l\'URL Supabase...\n')

  const projectRef = 'wodyrsasfqfoqdydrfew'
  
  console.log('📋 Informations de connexion Supabase:')
  console.log(`Project ID: ${projectRef}`)
  console.log('')
  
  console.log('🌐 Dashboard URL:')
  console.log(`https://supabase.com/dashboard/project/${projectRef}/settings/database`)
  console.log('')
  
  console.log('🔑 Format de l\'URL PostgreSQL:')
  console.log(`postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`)
  console.log('')
  
  console.log('📝 Étapes:')
  console.log('1. Ouvrir le dashboard Supabase ci-dessus')
  console.log('2. Aller dans Settings > Database')
  console.log('3. Copier la "Connection string" PostgreSQL')
  console.log('4. Exécuter: vercel env add DATABASE_URL production')
  console.log('5. Coller l\'URL (sans guillemets)')
  console.log('')
  
  console.log('🚀 Ensuite:')
  console.log('vercel --prod  # Redéployer')
  console.log('npx tsx scripts/test-migration-final.ts  # Tester')
  
  // Test direct avec l'API Supabase
  try {
    const response = await fetch(`https://${projectRef}.supabase.co/rest/v1/`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4'
      }
    })
    
    if (response.ok) {
      console.log('✅ Supabase API accessible')
    } else {
      console.log('⚠️ Vérifier la configuration API')
    }
  } catch (error) {
    console.log('⚠️ Test API:', error)
  }
}

getSupabaseUrl()
