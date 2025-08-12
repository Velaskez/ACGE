/**
 * Créer l'admin directement avec Prisma (bypass l'API)
 */

import { execSync } from 'child_process'

async function createAdminDirect() {
  console.log('👤 Création directe de l\'admin avec Prisma...\n')

  const projectRef = 'wodyrsasfqfoqdydrfew'
  const password = 'Reviti2025@'
  const encodedPassword = encodeURIComponent(password)
  const dbUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

  try {
    // Script SQL simple pour créer l'admin
    const sqlScript = `
      -- Supprimer l'admin s'il existe déjà
      DELETE FROM users WHERE email = 'admin@acge.ga';
      
      -- Créer l'admin avec mot de passe hashé
      INSERT INTO users (id, name, email, password, role, "createdAt", "updatedAt") 
      VALUES (
        'admin001',
        'Administrateur ACGE',
        'admin@acge.ga',
        '$2a$12$rQJ9lGHjm4ZvK3pFM6gRk.j5f0JQGTfNvN0qGd8mL4VdR5XoYkLWS',
        'ADMIN',
        NOW(),
        NOW()
      );
      
      -- Vérifier la création
      SELECT id, name, email, role FROM users WHERE email = 'admin@acge.ga';
    `

    console.log('📝 Exécution du script SQL...')
    
    // Sauvegarder le script dans un fichier temporaire
    require('fs').writeFileSync('temp-admin.sql', sqlScript)
    
    // Exécuter avec Prisma
    const result = execSync('npx prisma db execute --file temp-admin.sql', {
      env: {
        ...process.env,
        DATABASE_URL: dbUrl
      },
      encoding: 'utf8'
    })
    
    console.log('✅ Résultat SQL:')
    console.log(result)
    
    // Nettoyer le fichier temporaire
    require('fs').unlinkSync('temp-admin.sql')
    
    console.log('\n🎉 ADMIN CRÉÉ DIRECTEMENT!')
    console.log('📧 Email: admin@acge.ga')
    console.log('🔑 Mot de passe: admin123')
    console.log('🔑 Hash utilisé: $2a$12$rQJ9lGHjm4ZvK3pFM6gRk.j5f0JQGTfNvN0qGd8mL4VdR5XoYkLWS')
    
  } catch (error) {
    console.log('📋 Erreur:', error.toString())
  }
}

createAdminDirect()
