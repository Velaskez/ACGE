#!/usr/bin/env npx tsx

console.log('🔍 Test direct des APIs (bypass cache Prisma)...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function testDirectAPIs() {
  console.log('📊 Test des APIs critiques sans authentification...')
  
  const publicAPIs = [
    { name: 'Health', url: '/api/health' },
    { name: 'Debug Env', url: '/api/debug-env' },
    { name: 'Simple Stats', url: '/api/simple-stats' },
    { name: 'Simple Notifications', url: '/api/simple-notifications' }
  ]

  for (const api of publicAPIs) {
    try {
      console.log(`🔍 Test ${api.name}...`)
      
      const response = await fetch(`${APP_URL}${api.url}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${api.name} - Status 200`)
        console.log(`   Data: ${JSON.stringify(data).substring(0, 100)}...`)
      } else {
        console.log(`❌ ${api.name} - Status ${response.status}`)
        const text = await response.text()
        console.log(`   Error: ${text.substring(0, 150)}...`)
      }
    } catch (error) {
      console.log(`❌ ${api.name} - Erreur réseau: ${error}`)
    }
    console.log('') // Ligne vide pour lisibilité
  }
}

async function testWithOldLogin() {
  console.log('🔐 Test avec ancien token si disponible...')
  
  try {
    // Essayons de nous connecter avec les anciens identifiants
    const response = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acge.ga',
        password: 'admin123'
      })
    })

    if (response.ok) {
      const setCookie = response.headers.get('set-cookie')
      if (setCookie && setCookie.includes('auth-token=')) {
        console.log('✅ Connexion possible avec admin existant !')
        
        const match = setCookie.match(/auth-token=([^;]+)/)
        const token = match ? match[1] : null
        
        if (token) {
          // Tester les APIs avec auth
          console.log('\n📊 Test APIs avec authentification...')
          
          const authAPIs = [
            { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
            { name: 'Dashboard Activity', url: '/api/dashboard/activity' },
            { name: 'Notifications', url: '/api/notifications' }
          ]
          
          let successCount = 0
          
          for (const api of authAPIs) {
            try {
              console.log(`🔍 Test ${api.name}...`)
              
              const response = await fetch(`${APP_URL}${api.url}`, {
                headers: { 'Cookie': `auth-token=${token}` }
              })
              
              if (response.ok) {
                console.log(`✅ ${api.name} - Status 200 ✨`)
                successCount++
              } else {
                console.log(`❌ ${api.name} - Status ${response.status}`)
                if (response.status === 500) {
                  const text = await response.text()
                  console.log(`   500 Error: ${text.substring(0, 100)}...`)
                }
              }
            } catch (error) {
              console.log(`❌ ${api.name} - Erreur: ${error}`)
            }
          }
          
          console.log(`\n🎯 RÉSULTAT FINAL: ${successCount}/${authAPIs.length} APIs fonctionnelles`)
          
          if (successCount === authAPIs.length) {
            console.log('\n🎉 PROBLÈMES RÉSOLUS !')
            console.log('✅ Toutes les APIs critiques fonctionnent maintenant')
            console.log('✅ Les erreurs 500 ont été corrigées')
            console.log('\n🌐 Application opérationnelle: https://acge-zeta.vercel.app/login')
            console.log('🔑 Email: admin@acge.ga')
            console.log('🔑 Mot de passe: admin123')
          } else {
            console.log('\n⚠️ Certaines APIs ont encore des problèmes')
          }
        }
      }
    } else {
      console.log('❌ Connexion échouée - Admin non trouvé')
      const error = await response.json()
      console.log('   Détails:', error)
    }
  } catch (error) {
    console.log('❌ Erreur test connexion:', error)
  }
}

async function main() {
  console.log('🎯 TEST DIRECT DES APIS APRÈS CORRECTION')
  console.log('=' .repeat(60))
  
  await testDirectAPIs()
  await testWithOldLogin()
}

main().catch(console.error)
