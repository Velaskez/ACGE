// Script pour corriger les permissions PostgreSQL
import { config } from 'dotenv'
import path from 'path'
import { execSync } from 'child_process'

async function fixPostgreSQLPermissions() {
  console.log('🔧 Correction des permissions PostgreSQL...\n')
  
  try {
    // 1. Charger les variables d'environnement
    const envPath = path.join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    console.log('1. ⚙️ Configuration chargée')
    console.log(`   📋 DATABASE_URL: ${process.env.DATABASE_URL}`)
    
    // 2. Vérifier la configuration Docker
    console.log('\n2. 🐳 Vérification de la configuration Docker...')
    try {
      const env = execSync('docker exec acge-postgres env | grep POSTGRES', { encoding: 'utf8' })
      console.log('   ✅ Variables Docker PostgreSQL:')
      env.split('\n').forEach(line => {
        if (line.trim()) console.log(`      ${line}`)
      })
    } catch (error) {
      console.log('   ⚠️ Erreur de lecture des variables Docker')
    }
    
    // 3. Test direct avec psql
    console.log('\n3. 🧪 Test de connexion directe...')
    try {
      const result = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT current_user, current_database(), version();"', { encoding: 'utf8' })
      console.log('   ✅ Connexion directe réussie:')
      console.log(result)
    } catch (error) {
      console.log('   ❌ Connexion directe échouée')
      
      // Essayer de créer l'utilisateur si il n'existe pas
      console.log('   🔧 Tentative de création de l\'utilisateur...')
      try {
        execSync('docker exec acge-postgres createuser -U postgres acge_user', { encoding: 'utf8' })
        execSync('docker exec acge-postgres psql -U postgres -c "ALTER USER acge_user WITH PASSWORD \'acge_password_dev\';"', { encoding: 'utf8' })
        execSync('docker exec acge-postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE acge_database TO acge_user;"', { encoding: 'utf8' })
        console.log('   ✅ Utilisateur créé et configuré')
      } catch (createError) {
        console.log('   ⚠️ Erreur de création:', createError)
      }
    }
    
    // 4. Test avec Prisma après correction
    console.log('\n4. 🔗 Test Prisma après correction...')
    
    // Forcer la régénération du client Prisma
    try {
      execSync('rm -rf node_modules/.prisma', { stdio: 'pipe' })
    } catch {}
    
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    })
    
    try {
      await prisma.$connect()
      console.log('   ✅ Connexion Prisma réussie!')
      
      // Test de création de table
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT);`
      await prisma.$executeRaw`INSERT INTO test_table (name) VALUES ('PostgreSQL Test');`
      const result = await prisma.$queryRaw`SELECT * FROM test_table;`
      console.log('   ✅ Test CRUD réussi:', result)
      
      // Nettoyer
      await prisma.$executeRaw`DROP TABLE test_table;`
      
      await prisma.$disconnect()
      
      console.log('\n🎉 PostgreSQL complètement opérationnel!')
      console.log('\n📊 Informations de connexion:')
      console.log('   🗄️ Database: acge_database')
      console.log('   👤 User: acge_user')
      console.log('   🔑 Password: acge_password_dev')
      console.log('   🌐 Host: localhost:5432')
      
      console.log('\n▶️ Prochaines étapes:')
      console.log('   1. npx prisma db push (pour créer les tables de l\'application)')
      console.log('   2. npm run dev (pour redémarrer avec PostgreSQL)')
      console.log('   3. Tester les APIs')
      
    } catch (prismaError) {
      console.log('   ❌ Erreur Prisma persistante:', prismaError)
      
      console.log('\n🔄 Solutions alternatives:')
      console.log('   1. Recréer le container: docker-compose down && docker-compose up -d postgres')
      console.log('   2. Utiliser PostgreSQL local ou cloud')
      console.log('   3. Continuer avec SQLite (déjà fonctionnel)')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  }
}

fixPostgreSQLPermissions().catch(console.error)
