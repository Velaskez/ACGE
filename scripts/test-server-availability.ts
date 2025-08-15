#!/usr/bin/env tsx

async function testServerAvailability() {
  console.log('🌐 Test de disponibilité du serveur')
  console.log('===================================')
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // 1. Test de base - vérifier si le serveur répond
    console.log('\n1️⃣ Test de base du serveur...')
    
    const startTime = Date.now()
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    const endTime = Date.now()
    const responseTime = endTime - startTime
    
    console.log(`📡 Status: ${response.status}`)
    console.log(`⏱️ Temps de réponse: ${responseTime}ms`)
    console.log(`📄 Headers:`, Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      console.log('✅ Serveur répond correctement')
    } else if (response.status === 401) {
      console.log('✅ Serveur répond (401 attendu sans auth)')
    } else {
      console.log('⚠️ Serveur répond mais avec un statut inattendu')
    }
    
    // 2. Test avec timeout
    console.log('\n2️⃣ Test avec timeout...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    try {
      const responseWithTimeout = await fetch(`${baseUrl}/api/auth/me`, {
        method: 'GET',
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      console.log(`✅ Réponse avec timeout: ${responseWithTimeout.status}`)
    } catch (timeoutError) {
      clearTimeout(timeoutId)
      if (timeoutError.name === 'AbortError') {
        console.log('⏰ Timeout après 3 secondes')
      } else {
        console.log('❌ Erreur avec timeout:', timeoutError.message)
      }
    }
    
    // 3. Test de la page d'accueil
    console.log('\n3️⃣ Test de la page d\'accueil...')
    
    try {
      const homeResponse = await fetch(`${baseUrl}/`, {
        method: 'GET'
      })
      console.log(`📡 Status page d'accueil: ${homeResponse.status}`)
      
      if (homeResponse.ok) {
        console.log('✅ Page d\'accueil accessible')
      } else {
        console.log('❌ Page d\'accueil non accessible')
      }
    } catch (homeError) {
      console.log('❌ Erreur page d\'accueil:', homeError.message)
    }
    
    // 4. Test de l'API health si elle existe
    console.log('\n4️⃣ Test de l\'API health...')
    
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`, {
        method: 'GET'
      })
      console.log(`📡 Status health: ${healthResponse.status}`)
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log('✅ API health:', healthData)
      } else {
        console.log('⚠️ API health non disponible ou erreur')
      }
    } catch (healthError) {
      console.log('❌ Erreur API health:', healthError.message)
    }
    
    // 5. Recommandations
    console.log('\n5️⃣ Recommandations...')
    console.log('✅ Tests de disponibilité terminés')
    console.log('🔧 Si des erreurs persistent:')
    console.log('   1. Redémarrez le serveur de développement')
    console.log('   2. Vérifiez les logs du serveur')
    console.log('   3. Vérifiez la configuration réseau')
    console.log('   4. Testez avec un autre navigateur')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
    console.log('🔧 Le serveur semble indisponible')
    console.log('💡 Vérifiez que le serveur de développement est en cours d\'exécution')
  }
}

// Exécuter le test
testServerAvailability()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
