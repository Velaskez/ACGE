#!/usr/bin/env tsx

import { execSync } from 'child_process'

async function migrateProduction() {
  try {
    console.log('🔄 Génération du client Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('🔄 Application des migrations...')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    console.log('✅ Migration terminée avec succès!')
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

migrateProduction()
