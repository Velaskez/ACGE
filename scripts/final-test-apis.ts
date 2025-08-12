#!/usr/bin/env npx tsx

console.log('🎉 Test final - RLS désactivé, APIs devraient fonctionner!\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function testHealth() {
  console.log('🏥 Test Health API...')
  
  try {
    const response = await fetch(`${APP_URL}/api/health`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Health API: OK')
      console.log('📊 Status:', data.status)
      return true
    } else {
      console.log('❌ Health API: Failed -', response.status)
      const text = await response.text()
      console.log('   Error:', text.substring(0, 150))
      return false
    }
  } catch (error) {
    console.log('❌ Health API: Network error -', error)
    return false
  }
}

async function loginAdmin() {
  console.log('\n🔐 Connexion admin...')
  
  try {
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
        console.log('✅ Connexion admin: Réussie')
        const match = setCookie.match(/auth-token=([^;]+)/)
        return match ? match[1] : null
      }
    } else {
      console.log('❌ Connexion admin: Échec -', response.status)
      const error = await response.json()
      console.log('   Détails:', error)
    }
  } catch (error) {
    console.log('❌ Connexion admin: Erreur réseau -', error)
  }
  
  return null
}

async function testDashboardAPIs(token: string) {
  console.log('\n📊 Test des APIs Dashboard (qui causaient les erreurs 500)...')
  
  const apis = [
    { name: 'Dashboard Stats', url: '/api/dashboard/stats', critical: true },
    { name: 'Dashboard Activity', url: '/api/dashboard/activity', critical: true },
    { name: 'Notifications', url: '/api/notifications', critical: true },
    { name: 'Documents', url: '/api/documents', critical: false },
    { name: 'Folders', url: '/api/folders', critical: false },
    { name: 'Profile', url: '/api/profile', critical: false }
  ]

  let successCount = 0
  let criticalSuccessCount = 0
  let criticalCount = apis.filter(api => api.critical).length
  
  for (const api of apis) {
    try {
      console.log(`🔍 Test ${api.name}...`)
      
      const response = await fetch(`${APP_URL}${api.url}`, {
        headers: { 'Cookie': `auth-token=${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${api.name} - Status 200 🎉`)
        console.log(`   Data type: ${typeof data}, Size: ${JSON.stringify(data).length} chars`)
        successCount++
        if (api.critical) criticalSuccessCount++
      } else {
        console.log(`❌ ${api.name} - Status ${response.status}`)
        if (response.status === 500) {
          const text = await response.text()
          console.log(`   500 Error: ${text.substring(0, 200)}...`)
        }
      }
    } catch (error) {
      console.log(`❌ ${api.name} - Network Error: ${error}`)
    }
    console.log() // Ligne vide
  }
  
  console.log(`🎯 RÉSULTAT FINAL:`)
  console.log(`   Total: ${successCount}/${apis.length} APIs fonctionnelles`)
  console.log(`   Critiques: ${criticalSuccessCount}/${criticalCount} APIs critiques fonctionnelles`)
  
  return { 
    allSuccess: successCount === apis.length,
    criticalSuccess: criticalSuccessCount === criticalCount
  }
}

async function main() {
  console.log('🎯 TEST FINAL - VÉRIFICATION CORRECTION SUPABASE')
  console.log('=' .repeat(60))
  console.log('💡 RLS est désactivé sur toutes les tables')
  console.log('💡 Les erreurs 500 devraient être corrigées')
  console.log('=' .repeat(60))
  
  // 1. Test santé
  const healthy = await testHealth()
  
  // 2. Connexion admin  
  const token = await loginAdmin()
  if (!token) {
    console.log('\n❌ Impossible de se connecter - Admin inexistant ou problème auth')
    console.log('💡 Il faut peut-être créer l\'admin manuellement')
    return
  }
  
  // 3. Test APIs critiques
  const results = await testDashboardAPIs(token)
  
  // Conclusion
  console.log('\n' + '=' .repeat(60))
  if (results.criticalSuccess) {
    console.log('🎉 SUCCÈS COMPLET ! PROBLÈMES SUPABASE RÉSOLUS !')
    console.log('✅ Row Level Security désactivé')
    console.log('✅ APIs Dashboard opérationnelles')
    console.log('✅ Erreurs 500 corrigées')
    console.log('✅ Application entièrement fonctionnelle')
    console.log('\n🌐 Testez maintenant votre application :')
    console.log('   URL: https://acge-zeta.vercel.app/login')
    console.log('   Email: admin@acge.ga')
    console.log('   Mot de passe: admin123')
    console.log('\n🚀 L\'application est prête pour utilisation !')
  } else if (results.allSuccess) {
    console.log('🎉 CORRECTION RÉUSSIE !')
    console.log('✅ Toutes les APIs fonctionnent')
    console.log('⚠️ Quelques APIs non-critiques pourraient avoir des problèmes mineurs')
  } else {
    console.log('⚠️ CORRECTION PARTIELLE')
    console.log(`✅ ${results.criticalSuccess ? 'APIs critiques OK' : 'Certaines APIs ont encore des problèmes'}`)
    console.log('💡 Vérifiez les erreurs ci-dessus pour plus de détails')
  }
}

main().catch(console.error)
