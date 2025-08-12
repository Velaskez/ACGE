// Scripts rapides d'accès à la base PostgreSQL Docker

import { execSync } from 'child_process'

const commands = {
  // Accès direct au shell PostgreSQL
  shell: 'docker exec -it acge-postgres psql -U acge_user -d acge_database',
  
  // Commandes de consultation
  listTables: 'docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"',
  listUsers: 'docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT id, email, name, role, \\"createdAt\\" FROM users;"',
  listDocuments: 'docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT id, title, description, \\"createdAt\\" FROM documents LIMIT 10;"',
  listFolders: 'docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT id, name, description, \\"createdAt\\" FROM folders;"',
  
  // Statistiques
  stats: 'docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT \'users\' as table_name, COUNT(*) as count FROM users UNION SELECT \'documents\', COUNT(*) FROM documents UNION SELECT \'folders\', COUNT(*) FROM folders;"'
}

async function quickDBAccess() {
  console.log('🚀 Accès rapide à PostgreSQL Docker\n')
  
  // Vérifier que PostgreSQL Docker est actif
  try {
    execSync('docker exec acge-postgres pg_isready -U acge_user -d acge_database', { stdio: 'pipe' })
    console.log('✅ PostgreSQL Docker opérationnel\n')
  } catch {
    console.log('❌ PostgreSQL Docker non disponible')
    console.log('💡 Démarrez avec: docker-compose up -d postgres\n')
    return
  }
  
  console.log('📋 COMMANDES DISPONIBLES:\n')
  
  console.log('🔵 1. ACCÈS INTERACTIF')
  console.log(`   Commande: ${commands.shell}`)
  console.log('   Usage: Accès direct au shell PostgreSQL interactif\n')
  
  console.log('🔵 2. CONSULTATION RAPIDE')
  console.log('   📊 Lister les tables:')
  console.log(`      ${commands.listTables}`)
  console.log('')
  
  console.log('   👥 Voir les utilisateurs:')
  console.log(`      ${commands.listUsers}`)
  console.log('')
  
  console.log('   📄 Voir les documents:')
  console.log(`      ${commands.listDocuments}`)
  console.log('')
  
  console.log('   📁 Voir les dossiers:')
  console.log(`      ${commands.listFolders}`)
  console.log('')
  
  console.log('🔵 3. STATISTIQUES RAPIDES')
  console.log(`   ${commands.stats}`)
  console.log('')
  
  // Exécuter quelques commandes de base
  console.log('📊 ÉTAT ACTUEL DE LA BASE:\n')
  
  try {
    console.log('🔍 Tables disponibles:')
    const tables = execSync(commands.listTables, { encoding: 'utf8' })
    console.log(tables)
  } catch (error) {
    console.log('⚠️ Aucune table trouvée - La base est peut-être vide')
    console.log('💡 Créez les tables avec: npx prisma db push\n')
  }
  
  try {
    console.log('📈 Statistiques:')
    const stats = execSync(commands.stats, { encoding: 'utf8' })
    console.log(stats)
  } catch (error) {
    console.log('⚠️ Impossible d\'obtenir les statistiques\n')
  }
  
  console.log('🌐 INTERFACES WEB DISPONIBLES:\n')
  
  // Vérifier pgAdmin
  try {
    execSync('docker-compose ps pgadmin', { stdio: 'pipe' })
    console.log('✅ pgAdmin: http://localhost:8080')
    console.log('   👤 Email: admin@acge.local')
    console.log('   🔑 Password: admin123')
    console.log('   📊 Puis connecter à la base avec:')
    console.log('      Host: acge-postgres, Port: 5432')
    console.log('      Database: acge_database, User: acge_user, Password: acge_password_dev\n')
  } catch {
    console.log('⚠️ pgAdmin non démarré')
    console.log('💡 Démarrez avec: docker-compose up -d pgadmin\n')
  }
  
  console.log('🎨 Prisma Studio: npx prisma studio (http://localhost:5555)')
  console.log('')
  
  console.log('🔧 COMMANDES UTILES:\n')
  console.log('# Redémarrer PostgreSQL')
  console.log('docker-compose restart postgres')
  console.log('')
  console.log('# Voir les logs')
  console.log('docker-compose logs postgres')
  console.log('')
  console.log('# Backup de la base')
  console.log('docker exec acge-postgres pg_dump -U acge_user acge_database > backup.sql')
  console.log('')
  console.log('# Restore de la base')
  console.log('docker exec -i acge-postgres psql -U acge_user acge_database < backup.sql')
}

quickDBAccess().catch(console.error)
