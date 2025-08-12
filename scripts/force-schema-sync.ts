/**
 * Forcer la synchronisation du schéma avec Supabase
 */

import { execSync } from 'child_process'

async function forceSchemaSync() {
  console.log('🔄 Synchronisation forcée du schéma avec Supabase...\n')

  const projectRef = 'wodyrsasfqfoqdydrfew'
  const password = 'Reviti2025@'
  const encodedPassword = encodeURIComponent(password)
  const dbUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

  try {
    console.log('📊 Utilisation de Prisma db push --force-reset...')
    
    // Forcer la recréation complète
    const result = execSync('npx prisma db push --force-reset --accept-data-loss', {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl
      },
      encoding: 'utf8'
    })
    
    console.log('✅ Résultat:')
    console.log(result)
    
    console.log('\n🧪 Vérification post-sync...')
    
    // Tester la connexion
    const testResult = execSync('npx prisma db execute --stdin', {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl
      },
      input: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';',
      encoding: 'utf8'
    })
    
    console.log('📋 Tables créées:')
    console.log(testResult)
    
  } catch (error) {
    console.log('📋 Sortie de Prisma:', error.toString())
    
    // Si ça échoue, essayons au moins de lister les tables
    try {
      console.log('\n🔍 Tentative de vérification manuelle...')
      const listResult = execSync('npx prisma db execute --stdin', {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl
        },
        input: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\';',
        encoding: 'utf8'
      })
      console.log('Tables existantes:', listResult)
    } catch (e) {
      console.log('Impossible de lister les tables')
    }
  }
}

forceSchemaSync()
