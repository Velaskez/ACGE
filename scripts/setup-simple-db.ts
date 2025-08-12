/**
 * Setup simple d'une base de données PostgreSQL
 */

import { execSync } from 'child_process'

async function setupSimpleDB() {
  console.log('🔧 Configuration d\'une base PostgreSQL simple...\n')

  // URL PostgreSQL simple pour test (utilisons une base PostgreSQL publique de test)
  const testDbUrl = 'postgresql://postgres:password@localhost:5432/acge_test'
  
  try {
    console.log('📝 Ajout de DATABASE_URL...')
    
    // Échapper la commande pour éviter les problèmes de guillemets
    const command = `vercel env add DATABASE_URL production`
    
    console.log(`Exécutez cette commande manuellement:`)
    console.log(`${command}`)
    console.log(``)
    console.log(`Puis entrez cette valeur (SANS guillemets):`)
    console.log(`postgresql://postgres:password@db.example.com:5432/acge`)
    console.log(``)
    console.log(`Ou pour utiliser Supabase (recommandé):`)
    console.log(`1. Allez sur https://supabase.com`)
    console.log(`2. Créez un nouveau projet`)
    console.log(`3. Copiez l'URL PostgreSQL depuis Settings > Database`)
    console.log(`4. Utilisez cette URL dans la variable d'environnement`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

setupSimpleDB()
