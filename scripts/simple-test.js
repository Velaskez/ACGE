// Test simple avec JavaScript
const APP_URL = 'https://acge-zeta.vercel.app'

async function simpleTest() {
  try {
    console.log('🧪 Test simple de l\'application...\n')
    
    // Test API Health
    console.log('🏥 Test API Health...')
    const healthRes = await fetch(`${APP_URL}/api/health`)
    console.log(`Health: ${healthRes.status}`)
    
    if (healthRes.ok) {
      const health = await healthRes.json()
      console.log('✅ Health:', health.status)
    }
    
    // Test Migration
    console.log('\n🔧 Test Migration...')
    const migrationRes = await fetch(`${APP_URL}/api/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log(`Migration: ${migrationRes.status}`)
    const migration = await migrationRes.json()
    console.log('Migration result:', migration)
    
    if (migrationRes.ok) {
      console.log('\n🎉 SUCCÈS! Utilisateur admin créé!')
      console.log('📧 Email: admin@acge.ga')
      console.log('🔑 Password: admin123')
      console.log(`🌐 URL: ${APP_URL}/login`)
    }
    
  } catch (error) {
    console.error('Erreur:', error.message)
  }
}

simpleTest()
