/**
 * Test du dernier déploiement
 */

const LATEST_URL = 'https://acge-5q8kj9h9n-velaskezs-projects.vercel.app'

async function testLatestDeployment() {
  console.log('🧪 Test du dernier déploiement Vercel...\n')

  try {
    // Test 1: Page d'accueil
    console.log('1️⃣ Test de la page d\'accueil...')
    const homeResponse = await fetch(LATEST_URL)
    console.log(`   Status: ${homeResponse.status}`)
    
    if (homeResponse.ok) {
      console.log('   ✅ Page d\'accueil accessible')
    } else {
      console.log('   ❌ Page d\'accueil non accessible')
    }

    // Test 2: API Health
    console.log('\n2️⃣ Test de l\'API de santé...')
    const healthResponse = await fetch(`${LATEST_URL}/api/health`)
    console.log(`   Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('   ✅ API de santé fonctionnelle')
      console.log(`   📊 Data: ${JSON.stringify(healthData)}`)
    } else {
      console.log('   ❌ API de santé non fonctionnelle')
    }

    // Test 3: API Auth
    console.log('\n3️⃣ Test de l\'API d\'authentification...')
    const authResponse = await fetch(`${LATEST_URL}/api/auth/me`)
    console.log(`   Status: ${authResponse.status}`)
    
    if (authResponse.status === 401) {
      console.log('   ✅ API auth configurée (401 = normal sans token)')
    }

    // Test 4: Création d'admin
    console.log('\n4️⃣ Test de création d\'admin...')
    const adminResponse = await fetch(`${LATEST_URL}/api/force-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin ACGE',
        email: 'admin@acge.com',
        password: 'admin123456'
      })
    })
    
    const result = await adminResponse.json()
    console.log(`   Status: ${adminResponse.status}`)
    console.log(`   Response: ${JSON.stringify(result, null, 2)}`)
    
    if (adminResponse.status === 201) {
      console.log('\n🎉 Utilisateur admin créé avec succès!')
      console.log('📧 Email: admin@acge.com')
      console.log('🔑 Mot de passe: admin123456')
      console.log(`🌐 Login: ${LATEST_URL}/login`)
    } else if (adminResponse.status === 409) {
      console.log('\n✅ Admin existe déjà!')
      console.log(`🌐 Login: ${LATEST_URL}/login`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testLatestDeployment()
