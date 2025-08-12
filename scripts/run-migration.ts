/**
 * Script pour exécuter la migration de base de données
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function runMigration() {
  console.log('🚀 Exécution de la migration de base de données...\n')

  try {
    // Attendre que le redéploiement soit terminé
    console.log('⏳ Attente du redéploiement (30 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 30000))

    // Exécuter la migration
    console.log('🔧 Exécution de la migration...')
    const response = await fetch(`${APP_URL}/api/migrate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Migration réussie!')
      console.log('📊 Résultat:', JSON.stringify(result, null, 2))
      
      console.log('\n🎉 BASE DE DONNÉES INITIALISÉE!')
      console.log('📧 Email: admin@acge.ga')
      console.log('🔑 Mot de passe: admin123')
      console.log(`🌐 Login: ${APP_URL}/login`)
      
    } else {
      const errorText = await response.text()
      console.log('❌ Erreur migration:', errorText)
    }

    // Tester la connexion
    console.log('\n🧪 Test de connexion...')
    const loginTest = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@acge.ga',
        password: 'admin123'
      })
    })
    
    console.log(`Status login: ${loginTest.status}`)
    
    if (loginTest.ok) {
      console.log('✅ Connexion fonctionnelle!')
    } else {
      console.log('⚠️ Test de connexion à vérifier manuellement')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

runMigration()

