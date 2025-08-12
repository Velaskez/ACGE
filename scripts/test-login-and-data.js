// Test de connexion et récupération des données
const APP_URL = 'https://acge-zeta.vercel.app'

async function testLoginAndData() {
  console.log('🔐 Test de connexion et récupération des données...\n')

  try {
    // 1. Test de connexion
    console.log('1️⃣ Tentative de connexion avec admin@acge.ga...')
    const loginResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acge.ga',
        password: 'admin123'
      })
    })

    console.log(`Status login: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      console.log('✅ Connexion réussie!')
      
      // Récupérer le cookie d'authentification
      const setCookieHeader = loginResponse.headers.get('set-cookie')
      console.log('🍪 Cookie reçu:', setCookieHeader ? 'Oui' : 'Non')
      
      // Extraire le token du cookie
      let authToken = ''
      if (setCookieHeader) {
        const match = setCookieHeader.match(/auth-token=([^;]+)/)
        if (match) {
          authToken = match[1]
          console.log('🔑 Token extrait:', authToken.substring(0, 50) + '...')
        }
      }

      // 2. Test des APIs avec le token
      if (authToken) {
        console.log('\n2️⃣ Test des APIs avec authentification...')
        
        const apiTests = [
          { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
          { name: 'Dashboard Activity', url: '/api/dashboard/activity' },
          { name: 'Documents', url: '/api/documents' },
          { name: 'Folders', url: '/api/folders' }
        ]

        for (const test of apiTests) {
          try {
            console.log(`📡 Test: ${test.name}`)
            const response = await fetch(`${APP_URL}${test.url}`, {
              headers: {
                'Cookie': `auth-token=${authToken}`
              }
            })
            
            console.log(`   Status: ${response.status}`)
            
            if (response.ok) {
              const data = await response.json()
              console.log(`   ✅ Données récupérées: ${JSON.stringify(data).substring(0, 100)}...`)
            } else {
              const error = await response.text()
              console.log(`   ❌ Erreur: ${error.substring(0, 150)}`)
            }
          } catch (e) {
            console.log(`   ❌ Erreur réseau: ${e.message}`)
          }
        }
      }

    } else {
      const error = await loginResponse.json()
      console.log(`❌ Échec de la connexion: ${JSON.stringify(error)}`)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testLoginAndData()
