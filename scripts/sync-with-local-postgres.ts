// Script de synchronisation avec PostgreSQL local

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function syncWithLocalPostgreSQL() {
  console.log('🔄 Synchronisation PostgreSQL Docker ↔ Local\n')
  
  // Vérifier PostgreSQL Docker
  try {
    execSync('docker exec acge-postgres pg_isready -U acge_user -d acge_database', { stdio: 'pipe' })
    console.log('✅ PostgreSQL Docker: Disponible')
  } catch {
    console.log('❌ PostgreSQL Docker: Non disponible')
    console.log('💡 Démarrez avec: docker-compose up -d postgres')
    return
  }
  
  // Vérifier PostgreSQL local
  console.log('\n🔍 Détection PostgreSQL local...')
  
  const possiblePaths = [
    'C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe',
    'C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe',
    'psql' // Si dans le PATH
  ]
  
  let localPsql = null
  for (const psqlPath of possiblePaths) {
    try {
      execSync(`"${psqlPath}" --version`, { stdio: 'pipe' })
      localPsql = psqlPath
      console.log(`✅ PostgreSQL local trouvé: ${psqlPath}`)
      break
    } catch {
      // Continue à chercher
    }
  }
  
  if (!localPsql) {
    console.log('❌ PostgreSQL local non trouvé')
    console.log('')
    console.log('💡 OPTIONS ALTERNATIVES:')
    console.log('   1. Installer PostgreSQL depuis https://www.postgresql.org/download/windows/')
    console.log('   2. Utiliser uniquement Docker (recommandé pour le développement)')
    console.log('   3. Utiliser un service cloud (Supabase, Neon, Railway)')
    return
  }
  
  console.log('\n📋 OPTIONS DE SYNCHRONISATION:\n')
  
  console.log('🔵 OPTION 1: Export Docker → Import Local')
  console.log('   📤 Commandes pour exporter depuis Docker:')
  
  const exportCommands = [
    '# 1. Exporter le schéma uniquement',
    'docker exec acge-postgres pg_dump -U acge_user -s acge_database > schema_only.sql',
    '',
    '# 2. Exporter les données uniquement', 
    'docker exec acge-postgres pg_dump -U acge_user -a acge_database > data_only.sql',
    '',
    '# 3. Exporter schéma + données',
    'docker exec acge-postgres pg_dump -U acge_user acge_database > full_backup.sql'
  ]
  
  exportCommands.forEach(cmd => console.log(cmd))
  
  console.log('\n   📥 Puis importer dans PostgreSQL local:')
  const importCommands = [
    '# Créer la base locale',
    `"${localPsql}" -U postgres -c "CREATE DATABASE acge_local;"`,
    '',
    '# Importer le backup complet',
    `"${localPsql}" -U postgres -d acge_local -f full_backup.sql`
  ]
  
  importCommands.forEach(cmd => console.log(cmd))
  
  console.log('\n🔵 OPTION 2: Configuration pour utiliser PostgreSQL local')
  console.log('   ⚙️ Modifier .env.local:')
  console.log('      DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"')
  console.log('   🔧 Puis migrer: npx prisma db push')
  
  console.log('\n🔵 OPTION 3: Ports différents (Docker + Local en parallèle)')
  console.log('   🔧 Modifier docker-compose.yml:')
  console.log('      ports: ["5433:5432"]  # Docker sur port 5433')
  console.log('   📊 Accès:')
  console.log('      - Docker: localhost:5433')
  console.log('      - Local: localhost:5432')
  
  // Script automatique
  console.log('\n🚀 SYNCHRONISATION AUTOMATIQUE:\n')
  
  const backupScript = `
# Script PowerShell pour backup automatique
$backupName = "acge_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
docker exec acge-postgres pg_dump -U acge_user acge_database > $backupName
Write-Host "✅ Backup créé: $backupName"

# Pour importer dans PostgreSQL local:
# "${localPsql}" -U postgres -d acge_local -f $backupName
`
  
  console.log('💾 Script de backup automatique:')
  console.log(backupScript)
  
  // Créer le script
  const scriptPath = path.join(process.cwd(), 'scripts', 'backup-docker-to-local.ps1')
  fs.writeFileSync(scriptPath, backupScript)
  console.log(`📝 Script sauvé: ${scriptPath}`)
  
  console.log('\n🎯 RECOMMANDATIONS:\n')
  console.log('📈 Développement: Utilisez Docker (isolation, reproductibilité)')
  console.log('🏭 Production: PostgreSQL local ou cloud')
  console.log('🔄 Synchronisation: Scripts automatisés de backup/restore')
  console.log('📊 Monitoring: pgAdmin pour les deux environnements')
  
  console.log('\n💡 ÉTAPES SUIVANTES:')
  console.log('1. Choisissez une option ci-dessus')
  console.log('2. Testez avec un petit backup d\'abord') 
  console.log('3. Automatisez avec des scripts PowerShell')
  console.log('4. Configurez des sauvegardes régulières')
}

syncWithLocalPostgreSQL().catch(console.error)
