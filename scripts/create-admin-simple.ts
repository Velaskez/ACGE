/**
 * Script simple pour créer un admin
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function createAdmin() {
  console.log('🔧 Création d\'un utilisateur admin sur ACGE...\n')

  try {
    // Essayer setup-admin
    console.log('1️⃣ Essai avec setup-admin...')
    const setupResponse = await fetch(`${APP_URL}/api/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin ACGE',
        email: 'admin@acge.com',
        password: 'admin123456'
      })
    })
    
    console.log(`   Status: ${setupResponse.status}`)
    
    if (setupResponse.ok) {
      const result = await setupResponse.json()
      console.log('   ✅ Admin créé via setup-admin!')
      console.log('   📊 Réponse:', result)
    } else {
      console.log('   ❌ setup-admin a échoué')
    }

    // Test de l'application
    console.log('\n2️⃣ Test de l\'application...')
    const homeResponse = await fetch(APP_URL)
    console.log(`   Status page d'accueil: ${homeResponse.status}`)

    // Test d'une API
    const healthResponse = await fetch(`${APP_URL}/api/health`)
    console.log(`   Status API health: ${healthResponse.status}`)

    if (homeResponse.ok || healthResponse.ok) {
      console.log('\n🎉 APPLICATION FONCTIONNELLE !')
      console.log('🌐 URL:', APP_URL)
      console.log('🔐 Login:', `${APP_URL}/login`)
      console.log('📧 Email admin: admin@acge.com')
      console.log('🔑 Mot de passe: admin123456')
      
      console.log('\n📋 Étapes suivantes:')
      console.log('1. Allez sur', `${APP_URL}/login`)
      console.log('2. Connectez-vous avec admin@acge.com / admin123456')
      console.log('3. Explorez toutes les fonctionnalités!')
      console.log('4. Créez des dossiers, uploadez des documents')
      console.log('5. Testez le partage et les notifications')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

createAdmin()
