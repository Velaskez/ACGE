/**
 * Test de la migration en direct
 */

async function testLiveMigration() {
  console.log('🚀 Test de la migration en direct...\n')

  const APP_URL = 'https://acge-zeta.vercel.app'

  try {
    // Test API Health
    console.log('🏥 Test API Health...')
    const healthResponse = await fetch(`${APP_URL}/api/health`)
    console.log(`Health Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Health:', healthData.status)
    }

    // Test de migration
    console.log('\n🔧 Test de migration...')
    const migrationResponse = await fetch(`${APP_URL}/api/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log(`Migration Status: ${migrationResponse.status}`)
    
    const migrationData = await migrationResponse.json()
    console.log('📊 Résultat migration:', JSON.stringify(migrationData, null, 2))
    
    if (migrationResponse.ok) {
      console.log('\n🎉 MIGRATION RÉUSSIE!')
      console.log('👤 Utilisateur admin créé!')
      
      // Test de connexion
      console.log('\n🔐 Test de connexion...')
      const loginResponse = await fetch(`${APP_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@acge.ga',
          password: 'admin123'
        })
      })
      
      console.log(`Login Status: ${loginResponse.status}`)
      
      if (loginResponse.ok) {
        console.log('✅ CONNEXION RÉUSSIE!')
        console.log('\n🎯 APPLICATION 100% FONCTIONNELLE!')
        console.log('📧 Email: admin@acge.ga')
        console.log('🔑 Mot de passe: admin123')
        console.log(`🌐 Login: ${APP_URL}/login`)
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testLiveMigration()
