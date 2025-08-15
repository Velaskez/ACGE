#!/usr/bin/env tsx

async function testAuthMeEndpoint() {
  console.log('🔍 Test de l\'endpoint /api/auth/me')
  console.log('==================================')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // 1. Test sans authentification (devrait retourner 401)
    console.log('\n1️⃣ Test sans authentification...')
    
    const response1 = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET'
    })
    
    console.log(`📡 Status: ${response1.status}`)
    
    if (response1.status === 401) {
      console.log('✅ Réponse 401 correcte (non authentifié)')
      const data1 = await response1.json()
      console.log('📄 Réponse:', data1)
    } else {
      console.log('❌ Réponse inattendue:', response1.status)
    }
    
    // 2. Test avec authentification (se connecter d'abord)
    console.log('\n2️⃣ Test avec authentification...')
    
    // Se connecter avec l'admin
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@acge-gabon.com',
        password: 'admin123'
      })
    })
    
    console.log(`📡 Status login: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      console.log('✅ Connexion réussie')
      
      // Récupérer les cookies
      const cookies = loginResponse.headers.get('set-cookie')
      console.log('🍪 Cookies reçus:', cookies ? 'Oui' : 'Non')
      
      // Tester /api/auth/me avec les cookies
      const response2 = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Cookie': cookies || ''
        }
      })
      
      console.log(`📡 Status /api/auth/me: ${response2.status}`)
      
      if (response2.ok) {
        const data2 = await response2.json()
        console.log('✅ Données utilisateur récupérées:')
        console.log(JSON.stringify(data2, null, 2))
        
        if (data2.user && data2.user.email === 'admin@acge-gabon.com') {
          console.log('✅ Utilisateur correct récupéré')
        } else {
          console.log('❌ Utilisateur incorrect')
        }
      } else {
        console.log('❌ Erreur lors de la récupération des données utilisateur')
        const errorData = await response2.text()
        console.log('Erreur:', errorData)
      }
      
      // 3. Test de déconnexion
      console.log('\n3️⃣ Test de déconnexion...')
      
      const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || ''
        }
      })
      
      console.log(`📡 Status logout: ${logoutResponse.status}`)
      
      if (logoutResponse.ok) {
        console.log('✅ Déconnexion réussie')
      } else {
        console.log('❌ Erreur de déconnexion')
      }
      
    } else {
      console.log('❌ Échec de la connexion')
      const errorData = await loginResponse.text()
      console.log('Erreur:', errorData)
    }
    
    // 4. Test final sans authentification
    console.log('\n4️⃣ Test final sans authentification...')
    
    const response3 = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET'
    })
    
    console.log(`📡 Status final: ${response3.status}`)
    
    if (response3.status === 401) {
      console.log('✅ Déconnexion confirmée (401 retourné)')
    } else {
      console.log('❌ Problème avec la déconnexion')
    }
    
    console.log('\n✅ Test terminé avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test
testAuthMeEndpoint()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
