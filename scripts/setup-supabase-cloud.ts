#!/usr/bin/env tsx

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function main() {
  console.log('🚀 CONFIGURATION SUPABASE CLOUD POUR ACGE')
  console.log('==========================================\n')

  // Étape 1: Vérifier si .env.local existe
  const envPath = path.join(process.cwd(), '.env.local')
  const envExamplePath = path.join(process.cwd(), '.env.supabase.example')
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log('📝 Création du fichier .env.local depuis le template...')
    fs.copyFileSync(envExamplePath, envPath)
    console.log('✅ .env.local créé\n')
  }

  // Étape 2: Guide pour obtenir les credentials
  console.log('📋 ÉTAPES POUR OBTENIR VOS CREDENTIALS SUPABASE:\n')
  console.log('1. Allez sur https://supabase.com')
  console.log('2. Connectez-vous ou créez un compte')
  console.log('3. Créez un nouveau projet avec ces paramètres:')
  console.log('   - Name: acge-gabon')
  console.log('   - Database Password: [générez et sauvegardez]')
  console.log('   - Region: West EU (Ireland)')
  console.log('4. Une fois créé, allez dans Settings → Database')
  console.log('5. Copiez les informations de connexion\n')

  const hasProject = await question('Avez-vous déjà créé votre projet Supabase? (y/n): ')
  
  if (hasProject.toLowerCase() !== 'y') {
    console.log('\n👉 Créez d\'abord votre projet sur https://supabase.com')
    console.log('   Puis relancez ce script.')
    rl.close()
    return
  }

  // Étape 3: Collecter les informations
  console.log('\n📝 CONFIGURATION DES VARIABLES D\'ENVIRONNEMENT')
  console.log('Trouvez ces valeurs dans: Settings → Database → Connection string\n')

  const projectRef = await question('Project Reference (ex: abcdefghijklmnop): ')
  const dbPassword = await question('Database Password: ')
  const anonKey = await question('Anon Key (optionnel, appuyez sur Entrée pour ignorer): ')

  // Étape 4: Construire les URLs
  const databaseUrl = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
  const directUrl = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
  const supabaseUrl = `https://${projectRef}.supabase.co`

  // Étape 5: Mettre à jour .env.local
  console.log('\n📝 Mise à jour de .env.local...')
  
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''
  
  // Remplacer ou ajouter les variables
  const updateEnvVar = (name: string, value: string) => {
    const regex = new RegExp(`^${name}=.*$`, 'gm')
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${name}="${value}"`)
    } else {
      envContent += `\n${name}="${value}"`
    }
  }

  updateEnvVar('DATABASE_URL', databaseUrl)
  updateEnvVar('DIRECT_URL', directUrl)
  updateEnvVar('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl)
  
  if (anonKey) {
    updateEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', anonKey)
  }

  // Garder NEXTAUTH_SECRET si existant
  if (!envContent.includes('NEXTAUTH_SECRET')) {
    const secret = Buffer.from(Math.random().toString()).toString('base64')
    updateEnvVar('NEXTAUTH_SECRET', secret)
  }

  // Garder NEXTAUTH_URL
  if (!envContent.includes('NEXTAUTH_URL')) {
    updateEnvVar('NEXTAUTH_URL', 'http://localhost:3000')
  }

  fs.writeFileSync(envPath, envContent.trim() + '\n')
  console.log('✅ .env.local mis à jour\n')

  // Étape 6: Appliquer le schéma Prisma
  const applySchema = await question('Voulez-vous appliquer le schéma Prisma maintenant? (y/n): ')
  
  if (applySchema.toLowerCase() === 'y') {
    try {
      console.log('\n🔄 Application du schéma Prisma...')
      
      // Copier le schéma PostgreSQL
      const schemaSource = path.join(process.cwd(), 'prisma', 'schema.postgresql.prisma')
      const schemaDest = path.join(process.cwd(), 'prisma', 'schema.prisma')
      
      if (fs.existsSync(schemaSource)) {
        fs.copyFileSync(schemaSource, schemaDest)
        console.log('✅ Schéma PostgreSQL copié')
      }

      // Générer le client Prisma
      console.log('🔄 Génération du client Prisma...')
      execSync('npx prisma generate', { stdio: 'inherit' })
      
      // Pousser le schéma
      console.log('🔄 Push du schéma vers Supabase...')
      execSync('npx prisma db push', { stdio: 'inherit' })
      
      console.log('✅ Schéma appliqué avec succès!\n')

      // Étape 7: Créer l'admin
      const createAdmin = await question('Voulez-vous créer l\'utilisateur admin? (y/n): ')
      
      if (createAdmin.toLowerCase() === 'y') {
        console.log('\n🔄 Création de l\'admin...')
        execSync('npx tsx scripts/migrate-to-supabase.ts', { stdio: 'inherit' })
      }

    } catch (error) {
      console.error('❌ Erreur:', error)
    }
  }

  console.log('\n✨ Configuration terminée!')
  console.log('\n📝 Prochaines étapes:')
  console.log('1. Tester localement: npm run dev')
  console.log('2. Ouvrir Prisma Studio: npx prisma studio')
  console.log('3. Configurer les variables sur Vercel')
  console.log('4. Déployer: git push\n')

  rl.close()
}

main().catch(console.error)
