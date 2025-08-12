// Test pratique : Accès à PostgreSQL Docker

import { execSync } from 'child_process'

async function testAccessPostgreSQLDocker() {
  console.log('🧪 TEST: Accès à PostgreSQL dans Docker\n')
  
  console.log('🔍 Étape 1: Vérification des containers...')
  try {
    const containers = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"', { encoding: 'utf8' })
    console.log(containers)
    
    if (containers.includes('acge-postgres')) {
      console.log('✅ Container PostgreSQL trouvé et actif!')
    } else {
      console.log('❌ Container PostgreSQL non trouvé')
      console.log('💡 Lancez: docker-compose up -d')
      return
    }
    
    if (containers.includes('acge-pgadmin')) {
      console.log('✅ Container pgAdmin trouvé et actif!')
    } else {
      console.log('⚠️ Container pgAdmin non trouvé')
    }
  } catch (error) {
    console.log('❌ Erreur Docker:', error.message)
    console.log('💡 Assurez-vous que Docker Desktop est démarré')
    return
  }
  
  console.log('\n🔍 Étape 2: Test de connexion à la base de données...')
  try {
    // Test de connexion basique
    const result = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT version();"', { 
      encoding: 'utf8',
      timeout: 10000 
    })
    console.log('✅ Connexion PostgreSQL réussie!')
    console.log('📊 Version:', result.trim().split('\n')[2])
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message)
  }
  
  console.log('\n🔍 Étape 3: Vérification des tables...')
  try {
    const tables = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"', { 
      encoding: 'utf8',
      timeout: 10000 
    })
    console.log('✅ Tables dans la base de données:')
    console.log(tables)
  } catch (error) {
    console.log('⚠️ Erreur lors de la liste des tables:', error.message)
  }
  
  console.log('\n🌐 ACCÈS WEB:')
  console.log('📱 pgAdmin: http://localhost:8080')
  console.log('   👤 Email: admin@acge.local')
  console.log('   🔑 Mot de passe: admin123')
  console.log('')
  
  console.log('🗄️ CONNEXION BASE DE DONNÉES dans pgAdmin:')
  console.log('   🏠 Host: acge-postgres')
  console.log('   🔌 Port: 5432')
  console.log('   📊 Database: acge_database')
  console.log('   👤 Username: acge_user')
  console.log('   🔑 Password: acge_password_dev')
  console.log('')
  
  console.log('🎯 ACTIONS RECOMMANDÉES:')
  console.log('1. 📱 Ouvrez http://localhost:8080 dans votre navigateur')
  console.log('2. 🔐 Connectez-vous avec admin@acge.local / admin123')
  console.log('3. ➕ Ajoutez un nouveau serveur avec les infos ci-dessus')
  console.log('4. 🎉 Explorez vos données!')
  console.log('')
  
  console.log('💡 COMMANDES RAPIDES pour la ligne de commande:')
  console.log('• Accès direct: docker exec -it acge-postgres psql -U acge_user -d acge_database')
  console.log('• Voir les tables: docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"')
  console.log('• Backup: docker exec acge-postgres pg_dump -U acge_user acge_database > backup_$(Get-Date -Format "yyyy-MM-dd").sql')
}

testAccessPostgreSQLDocker().catch(console.error)
