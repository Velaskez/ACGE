import { execSync } from 'child_process'

async function getSupabaseKeys() {
  console.log('🔑 Récupération des clés Supabase...')

  try {
    // Récupérer les informations du projet
    const projectInfo = execSync('npx supabase projects list --output json', { encoding: 'utf8' })
    const projects = JSON.parse(projectInfo)
    
    const project = projects.find((p: any) => p.id === 'wodyrsasfqfoqdydrfew')
    
    if (!project) {
      console.error('❌ Projet Supabase non trouvé')
      return
    }

    console.log('✅ Projet trouvé:', project.name)
    console.log('📋 ID du projet:', project.id)
    console.log('🌍 Région:', project.region)

    // Récupérer les clés API
    console.log('\n🔑 Récupération des clés API...')
    
    try {
      const apiKeys = execSync('npx supabase projects api-keys --project-ref wodyrsasfqfoqdydrfew --output json', { encoding: 'utf8' })
      const keys = JSON.parse(apiKeys)
      
      console.log('\n📋 Clés Supabase :')
      console.log('=' * 50)
      console.log('🌐 URL du projet:')
      console.log(`https://${project.id}.supabase.co`)
      console.log('\n🔑 Clé anon (publique):')
      console.log(keys.anon)
      console.log('\n🔐 Clé service_role (privée):')
      console.log(keys.service_role)
      
      console.log('\n📝 Variables d\'environnement à copier :')
      console.log('=' * 50)
      console.log(`NEXT_PUBLIC_SUPABASE_URL="https://${project.id}.supabase.co"`)
      console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY="${keys.anon}"`)
      console.log(`SUPABASE_SERVICE_ROLE_KEY="${keys.service_role}"`)
      
    } catch (error) {
      console.log('⚠️ Impossible de récupérer les clés via CLI')
      console.log('📋 Récupérez-les manuellement sur :')
      console.log('https://supabase.com/dashboard/project/wodyrsasfqfoqdydrfew/settings/api')
    }

  } catch (error) {
    console.error('❌ Erreur récupération clés:', error)
    console.log('\n📋 Récupérez les clés manuellement :')
    console.log('1. Allez sur https://supabase.com/dashboard')
    console.log('2. Sélectionnez votre projet')
    console.log('3. Settings > API')
    console.log('4. Copiez les clés anon et service_role')
  }
}

getSupabaseKeys()
