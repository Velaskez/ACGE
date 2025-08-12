/**
 * Configuration de la base Supabase pour ACGE
 */

async function setupSupabaseDB() {
  console.log('🚀 Configuration Supabase pour ACGE...\n')

  // Informations du projet Supabase
  const projectRef = 'wodyrsasfqfoqdydrfew'
  const projectUrl = `https://${projectRef}.supabase.co`
  
  // URL PostgreSQL directe pour Supabase
  const postgresUrl = `postgresql://postgres.${projectRef}:YOUR_DB_PASSWORD@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`
  
  console.log('📊 Informations du projet Supabase:')
  console.log(`   - Project Ref: ${projectRef}`)
  console.log(`   - Project URL: ${projectUrl}`)
  console.log(`   - PostgreSQL URL: ${postgresUrl}`)
  console.log('')
  
  console.log('🔧 Étapes suivantes:')
  console.log('1. Récupérer le mot de passe de la base depuis le dashboard Supabase')
  console.log(`2. Aller sur: https://supabase.com/dashboard/project/${projectRef}/settings/database`)
  console.log('3. Copier la "Connection string" dans la section "Database"')
  console.log('4. Ajouter cette URL à Vercel avec la commande:')
  console.log('   vercel env add DATABASE_URL production')
  console.log('')
  
  console.log('🎯 Commandes à exécuter:')
  console.log(`npx supabase db push --project-ref ${projectRef}`)
  console.log('# Pour synchroniser notre schéma Prisma avec Supabase')
  
  return {
    projectRef,
    projectUrl,
    databaseSettingsUrl: `https://supabase.com/dashboard/project/${projectRef}/settings/database`
  }
}

setupSupabaseDB()
