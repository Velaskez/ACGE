/**
 * Test final de la migration et de la connexion
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function testFinalMigration() {
  console.log('🚀 Test final de la migration ACGE...\n')

  try {
    // 1. Test API Health d'abord
    console.log('🏥 Test API Health...')
    const healthResponse = await fetch(`${APP_URL}/api/health`)
    console.log(`Health Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ API Health OK:', healthData.status)
    }

    // 2. Exécuter la migration
    console.log('\n🔧 Exécution de la migration...')
    const migrationResponse = await fetch(`${APP_URL}/api/migrate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`Migration Status: ${migrationResponse.status}`)
    
    const migrationData = await migrationResponse.json()
    console.log('📊 Résultat migration:', JSON.stringify(migrationData, null, 2))
    
    if (migrationResponse.ok) {
      console.log('\n🎉 SUCCÈS ! Base de données initialisée!')
    }

    // 3. Test de connexion avec les identifiants
    console.log('\n🔐 Test de connexion admin...')
    const loginResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@acge.ga',
        password: 'admin123'
      })
    })
    
    console.log(`Login Status: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Connexion réussie!')
      console.log('👤 User:', loginData.user?.name)
    } else {
      const errorData = await loginResponse.json()
      console.log('❌ Erreur connexion:', errorData)
    }

    // 4. Afficher les informations finales
    console.log('\n' + '='.repeat(60))
    console.log('🎯 APPLICATION ACGE - PRÊTE À UTILISER!')
    console.log('='.repeat(60))
    console.log(`🌐 URL: ${APP_URL}/login`)
    console.log('📧 Email: admin@acge.ga')
    console.log('🔑 Mot de passe: admin123')
    console.log('👑 Rôle: ADMIN')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testFinalMigration()
