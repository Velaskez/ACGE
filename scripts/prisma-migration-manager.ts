import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function prismaMigrationManager() {
  console.log('🔄 Gestionnaire de Migrations Prisma\n')
  
  try {
    // 1. Vérifier l'état actuel
    console.log('1. 📊 État actuel de la base de données...')
    await prisma.$connect()
    console.log('   ✅ Connexion établie')
    
    // 2. Vérifier les tables existantes
    console.log('\n2. 📋 Tables existantes...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    console.log('   Tables trouvées:', (tables as any[]).map(t => t.table_name).join(', '))
    
    // 3. Vérifier les contraintes et index
    console.log('\n3. 🔗 Contraintes et index...')
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type
    `
    
    console.log('   Contraintes trouvées:')
    ;(constraints as any[]).forEach(c => {
      console.log(`     - ${c.table_name}.${c.column_name}: ${c.constraint_type}`)
    })
    
    // 4. Vérifier les séquences
    console.log('\n4. 🔢 Séquences...')
    const sequences = await prisma.$queryRaw`
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    `
    console.log('   Séquences trouvées:', (sequences as any[]).map(s => s.sequence_name).join(', '))
    
    // 5. Recommandations d'optimisation
    console.log('\n5. ⚡ Recommandations d\'optimisation...')
    
    // Vérifier les index manquants
    const missingIndexes = await prisma.$queryRaw`
      SELECT 
        t.table_name,
        c.column_name
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public'
      AND c.column_name IN ('email', 'created_at', 'updated_at')
      AND NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = t.table_name 
        AND indexdef LIKE '%' || c.column_name || '%'
      )
    `
    
    if ((missingIndexes as any[]).length > 0) {
      console.log('   ⚠️ Index recommandés:')
      ;(missingIndexes as any[]).forEach(idx => {
        console.log(`     - ${idx.table_name}.${idx.column_name}`)
      })
    } else {
      console.log('   ✅ Index optimaux détectés')
    }
    
    // 6. Commandes de migration
    console.log('\n6. 🛠️ Commandes de migration disponibles:')
    console.log('   npx prisma migrate dev --name init     # Créer une migration initiale')
    console.log('   npx prisma migrate dev                 # Créer et appliquer une migration')
    console.log('   npx prisma migrate deploy              # Déployer les migrations en production')
    console.log('   npx prisma migrate reset               # Réinitialiser la base (⚠️ DANGEREUX)')
    console.log('   npx prisma migrate status              # Vérifier le statut des migrations')
    console.log('   npx prisma db push                     # Pousser le schéma sans migration')
    
    // 7. État des migrations
    console.log('\n7. 📋 État des migrations...')
    try {
      const migrationStatus = execSync('npx prisma migrate status', { encoding: 'utf8' })
      console.log('   Statut des migrations:')
      console.log(migrationStatus.split('\n').map(line => `     ${line}`).join('\n'))
    } catch (error) {
      console.log('   ℹ️ Aucune migration trouvée (utilisation de db push)')
    }
    
    // 8. Actions recommandées
    console.log('\n8. 🎯 Actions recommandées:')
    console.log('   • Créer une migration initiale: npx prisma migrate dev --name init')
    console.log('   • Vérifier les performances: npx prisma studio')
    console.log('   • Optimiser les requêtes avec des index si nécessaire')
    console.log('   • Sauvegarder la base avant modifications importantes')
    
    console.log('\n🎉 Gestionnaire de migrations Prisma prêt!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la gestion des migrations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

prismaMigrationManager().catch(console.error)
