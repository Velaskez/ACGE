import { Client } from 'pg'

async function createDatabase() {
  console.log('🔍 Configuration PostgreSQL détectée :')
  console.log('Host: localhost')
  console.log('Port: 5432')
  console.log('User: postgres')
  console.log('Database: postgres (pour création)')
  console.log('')
  
  // Essayons avec différents mots de passe
  const commonPasswords = ['Reviti2025', 'Reviti2025@', 'postgres', 'admin', 'password', '', '123456', 'root']
  let client = null
  let connected = false
  
  for (const password of commonPasswords) {
    try {
      console.log(`🔐 Tentative avec mot de passe: "${password || '(vide)'}"`)
      client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: password,
        database: 'postgres'
      })
      
      await client.connect()
      console.log('✅ Connexion réussie !')
      connected = true
      break
    } catch (error) {
      console.log('❌ Échec')
      if (client) {
        await client.end().catch(() => {})
      }
    }
  }
  
  if (!connected) {
    console.log('\n❌ Impossible de se connecter avec les mots de passe courants')
    console.log('\n💡 Solutions :')
    console.log('1. Modifiez le mot de passe dans scripts/create-database.ts')
    console.log('2. Ou utilisez pgAdmin pour créer la base "ged_database" manuellement')
    console.log('3. Ou réinitialisez le mot de passe postgres')
    return
  }

  try {
    if (!client) {
      console.log('❌ Pas de connexion disponible')
      return
    }

    // Vérifier si la base existe déjà
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ged_database'"
    )

    if (result.rows.length > 0) {
      console.log('✅ La base de données "ged_database" existe déjà')
    } else {
      // Créer la base de données
      await client.query('CREATE DATABASE ged_database')
      console.log('✅ Base de données "ged_database" créée avec succès')
    }

    console.log('\n🔄 Étapes suivantes :')
    console.log('1. Créer les tables : npm run db:push')
    console.log('2. Créer un admin : npm run create-admin')
    console.log('3. Démarrer l\'app : npm run dev')

  } catch (error) {
    console.error('❌ Erreur:', error)
    console.log('\n💡 Vérifiez que :')
    console.log('- PostgreSQL est démarré')
    console.log('- Les identifiants dans le script sont corrects')
    console.log('- Le port 5432 est accessible')
  } finally {
    if (client) {
      await client.end()
    }
  }
}

createDatabase()
