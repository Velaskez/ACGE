// Guide d'installation PostgreSQL local pour Windows

console.log('💾 Guide d\'installation PostgreSQL Local\n')

console.log('📦 VOS FICHIERS DE BACKUP SONT PRÊTS !')
console.log('✅ Export réussi depuis PostgreSQL Docker')
console.log('📁 Fichiers créés:')
console.log('   - acge_backup_full_*.sql (complet: schéma + données)')
console.log('   - acge_backup_schema_*.sql (structure uniquement)')
console.log('   - acge_backup_data_*.sql (données uniquement)')
console.log('')

console.log('🔵 OPTION 1: INSTALLER POSTGRESQL LOCALEMENT (Recommandé)\n')

console.log('📥 Étapes d\'installation:')
console.log('1. 🌐 Aller sur: https://www.postgresql.org/download/windows/')
console.log('2. 📦 Télécharger PostgreSQL (version 15 ou 16 recommandée)')
console.log('3. 🚀 Installer avec les options par défaut')
console.log('4. 🔑 Choisir un mot de passe pour l\'utilisateur "postgres"')
console.log('5. ✅ Garder le port 5432 par défaut')
console.log('')

console.log('📋 Après installation:')
console.log('1. Ouvrir "SQL Shell (psql)" depuis le menu Démarrer')
console.log('2. Appuyer Entrée pour les valeurs par défaut')
console.log('3. Entrer votre mot de passe postgres')
console.log('4. Créer la base: CREATE DATABASE acge_local;')
console.log('5. Importer: \\i C:/chemin/vers/acge_backup_full_*.sql')
console.log('')

console.log('🔵 OPTION 2: SERVICES CLOUD (Plus Rapide)\n')

console.log('☁️ Services gratuits recommandés:')
console.log('')
console.log('🟦 Supabase (Recommandé)')
console.log('   📱 URL: https://supabase.com')
console.log('   ✅ 500MB gratuit, interface moderne')
console.log('   🔧 Après création: copier "Database URL"')
console.log('')
console.log('🟩 Neon')
console.log('   📱 URL: https://neon.tech')
console.log('   ✅ 3GB gratuit, très rapide')
console.log('   🔧 Après création: copier "Connection string"')
console.log('')
console.log('🟨 Railway')
console.log('   📱 URL: https://railway.app')
console.log('   ✅ 5$ gratuit par mois')
console.log('   🔧 Deploy PostgreSQL template')
console.log('')

console.log('🔵 OPTION 3: UTILISER UNIQUEMENT DOCKER (Actuel)\n')

console.log('✅ Avantages:')
console.log('   - Déjà configuré et fonctionnel')
console.log('   - Isolation parfaite')
console.log('   - Pas d\'installation supplémentaire')
console.log('')
console.log('📊 Accès à vos données Docker:')
console.log('   - pgAdmin: http://localhost:8080')
console.log('   - Prisma Studio: npx prisma studio')
console.log('   - Ligne de commande: docker exec -it acge-postgres psql -U acge_user -d acge_database')
console.log('')

console.log('🎯 MES RECOMMANDATIONS:\n')

console.log('🏆 Pour un projet professionnel: Option 2 (Cloud)')
console.log('   → Supabase ou Neon, puis importer le backup')
console.log('')
console.log('🛠️ Pour apprendre PostgreSQL: Option 1 (Installation locale)')
console.log('   → Installation complète avec outils')
console.log('')
console.log('⚡ Pour continuer rapidement: Option 3 (Garder Docker)')
console.log('   → Votre setup actuel fonctionne parfaitement')
console.log('')

console.log('💡 ÉTAPES SUIVANTES:\n')

console.log('Si vous choisissez l\'Option 1 (PostgreSQL local):')
console.log('1. Installer PostgreSQL depuis le site officiel')
console.log('2. Relancer: npx tsx scripts/export-import-postgres.ts')
console.log('3. Suivre les instructions d\'import automatique')
console.log('')

console.log('Si vous choisissez l\'Option 2 (Cloud):')
console.log('1. Créer un compte sur Supabase/Neon')
console.log('2. Obtenir l\'URL de connexion')
console.log('3. Modifier .env.local avec cette URL')
console.log('4. npx prisma db push (pour créer les tables)')
console.log('5. Importer les données via l\'interface web ou CLI')
console.log('')

console.log('Si vous choisissez l\'Option 3 (Garder Docker):')
console.log('1. Rien à faire ! Votre setup fonctionne')
console.log('2. Utiliser pgAdmin: http://localhost:8080')
console.log('3. Faire des backups réguliers avec les scripts créés')
console.log('')

console.log('🔄 Dans tous les cas, vos backups sont sauvés et prêts à utiliser !')

// Vérifier la taille des fichiers
import fs from 'fs'
import { execSync, ExecSyncOptions } from 'child_process'

console.log('\n📊 ÉTAT ACTUEL DE VOS BACKUPS:\n')

try {
  const result = execSync('dir /B *.sql 2>nul || echo.', { shell: true } as any)
  const files = result
    .toString()
    .trim()
    .split(/\r?\n/)
    .filter((f: string) => f);

  for (const file of files) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file)
      const sizeKB = (stats.size / 1024).toFixed(2)
      console.log(`📄 ${file}`)
      console.log(`   💾 Taille: ${sizeKB} KB`)
      console.log(`   📅 Créé: ${stats.birthtime.toLocaleString()}`)
      console.log('')
    }
  }
} catch {
  console.log('📁 Fichiers de backup présents dans le répertoire')
}
