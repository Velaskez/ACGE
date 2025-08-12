/**
 * Pousser le schéma Prisma vers Supabase
 */

import { execSync } from 'child_process'

async function pushSchemaToSupabase() {
  console.log('🚀 Poussée du schéma Prisma vers Supabase...\n')

  try {
    console.log('📊 Configuration de l\'URL de base de données...')
    
    // Créer un fichier .env temporaire avec l'URL Supabase
    const projectRef = 'wodyrsasfqfoqdydrfew'
    const password = 'Reviti2025@'
    const encodedPassword = encodeURIComponent(password)
    const dbUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`
    
    console.log('🔧 Utilisation de Prisma migrate...')
    
    // Créer les tables avec Prisma
    console.log('Exécution de: npx prisma db push --accept-data-loss')
    
    try {
      const result = execSync('npx prisma db push --accept-data-loss', {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl
        },
        encoding: 'utf8'
      })
      
      console.log('✅ Schéma poussé avec succès!')
      console.log(result)
      
    } catch (error) {
      console.log('📋 Sortie de Prisma:', error.toString())
    }
    
    console.log('\n🧪 Test de connexion après migration...')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

pushSchemaToSupabase()
