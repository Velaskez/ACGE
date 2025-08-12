// Guide d'accès à PostgreSQL Docker + Synchronisation avec installation locale

console.log('🐘 Guide d\'accès à PostgreSQL Docker\n')

console.log('📋 MÉTHODES D\'ACCÈS À LA BASE DOCKER:\n')

console.log('🔵 1. VIA PGADMIN (Interface Web - Recommandé)')
console.log('   🌐 URL: http://localhost:8080')
console.log('   👤 Email: admin@acge.local')
console.log('   🔑 Password: admin123')
console.log('   📊 Ensuite connecter à:')
console.log('      - Host: acge-postgres (ou postgres)')
console.log('      - Port: 5432')
console.log('      - Database: acge_database')
console.log('      - User: acge_user')
console.log('      - Password: acge_password_dev')
console.log('')

console.log('🔵 2. VIA LIGNE DE COMMANDE (Direct)')
console.log('   💻 Commandes disponibles:')
console.log('   # Accès direct au container')
console.log('   docker exec -it acge-postgres psql -U acge_user -d acge_database')
console.log('')
console.log('   # Lister les tables')
console.log('   docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"')
console.log('')
console.log('   # Compter les enregistrements')
console.log('   docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT COUNT(*) FROM users;"')
console.log('')

console.log('🔵 3. VIA CLIENTS EXTERNES (PgAdmin local, DBeaver, etc.)')
console.log('   🔗 Paramètres de connexion:')
console.log('      - Host: localhost (ou 127.0.0.1)')
console.log('      - Port: 5432')
console.log('      - Database: acge_database')
console.log('      - User: acge_user')
console.log('      - Password: acge_password_dev')
console.log('')

console.log('🔵 4. VIA PRISMA STUDIO')
console.log('   🎨 Interface visuelle pour Prisma:')
console.log('   npx prisma studio')
console.log('   📱 Ouvrira: http://localhost:5555')
console.log('')

console.log('🔄 SYNCHRONISATION AVEC POSTGRESQL LOCAL:\n')

console.log('🟢 OPTION A: Utiliser PostgreSQL local au lieu de Docker')
console.log('   ✅ Avantages: Performance, intégration native')
console.log('   ⚠️ Inconvénients: Configuration manuelle requise')
console.log('   🔧 Configuration:')
console.log('      1. Créer une base: createdb acge_local')
console.log('      2. Modifier .env.local avec: postgresql://postgres:motdepasse@localhost:5432/acge_local')
console.log('      3. npx prisma db push')
console.log('')

console.log('🟡 OPTION B: Réplication/Synchronisation des données')
console.log('   📊 Méthodes disponibles:')
console.log('   1. Export/Import régulier')
console.log('   2. pg_dump/pg_restore')
console.log('   3. Logical replication (avancé)')
console.log('')

console.log('🔴 OPTION C: Port mapping vers PostgreSQL local')
console.log('   ⚠️ Attention: Conflits de ports possibles')
console.log('   🔧 Modifier docker-compose.yml: "5433:5432" au lieu de "5432:5432"')
console.log('')

console.log('💡 RECOMMANDATIONS:\n')
console.log('📈 Pour le développement: Gardez Docker (isolé, reproductible)')
console.log('🏭 Pour la production: Utilisez PostgreSQL local ou cloud')
console.log('🔄 Pour la synchronisation: Scripts de backup/restore automatisés')

import { execSync } from 'child_process'

console.log('\n🔍 ÉTAT ACTUEL:\n')

try {
  // Vérifier si Docker PostgreSQL est en cours
  const dockerPs = execSync('docker-compose ps postgres', { encoding: 'utf8' })
  if (dockerPs.includes('Up')) {
    console.log('✅ PostgreSQL Docker: En cours d\'exécution')
    
    // Tester la connexion
    try {
      const testConn = execSync('docker exec acge-postgres pg_isready -U acge_user -d acge_database', { encoding: 'utf8' })
      console.log('✅ Connexion: Opérationnelle')
    } catch {
      console.log('⚠️ Connexion: Problème détecté')
    }
    
    // Vérifier les données
    try {
      const userCount = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -t -c "SELECT COUNT(*) FROM users;"', { encoding: 'utf8' })
      console.log(`📊 Utilisateurs dans la base: ${userCount.trim()}`)
    } catch {
      console.log('⚠️ Impossible de compter les utilisateurs (tables peut-être non créées)')
    }
    
  } else {
    console.log('❌ PostgreSQL Docker: Non démarré')
    console.log('💡 Démarrez avec: docker-compose up -d postgres')
  }
} catch {
  console.log('❌ Docker: Non disponible ou non configuré')
}

// Vérifier PostgreSQL local
console.log('\n🔍 PostgreSQL Local:')
try {
  const localPg = execSync('psql --version', { encoding: 'utf8' })
  console.log('✅ PostgreSQL local installé:', localPg.trim())
  
  // Vérifier si le service est en cours
  try {
    const pgStatus = execSync('pg_isready', { encoding: 'utf8' })
    console.log('✅ Service PostgreSQL local: Actif')
  } catch {
    console.log('⚠️ Service PostgreSQL local: Non démarré ou non configuré')
  }
} catch {
  console.log('❌ PostgreSQL local: Non installé ou non dans le PATH')
}
