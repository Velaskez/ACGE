#!/usr/bin/env npx tsx

console.log('🔧 Test correction Supabase simplifiée...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function testSimpleFix() {
  console.log('📋 Étape 1: Test correction simple...')
  
  try {
    const response = await fetch(`${APP_URL}/api/fix-supabase-simple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Correction simple réussie !')
      console.log('📊 Résultats:')
      data.results.forEach((result: string) => console.log('  ', result))
      return true
    } else {
      const error = await response.json()
      console.log('❌ Erreur correction:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return false
  }
}

async function createAdminClean() {
  console.log('\n📋 Étape 2: Création admin propre...')
  
  try {
    const response = await fetch(`${APP_URL}/api/create-admin-clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Admin créé avec succès !')
      console.log('👤 Admin:', data.admin.email, '- Role:', data.admin.role)
      return data.credentials
    } else {
      const error = await response.json()
      console.log('❌ Erreur création admin:', error)
      return null
    }
  } catch (error) {
    console.log('❌ Erreur réseau admin:', error)
    return null
  }
}

async function testLogin(credentials: any) {
  console.log('\n📋 Étape 3: Test de connexion...')
  
  try {
    const response = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (response.ok) {
      const setCookie = response.headers.get('set-cookie')
      if (setCookie && setCookie.includes('auth-token=')) {
        console.log('✅ Connexion réussie !')
        const match = setCookie.match(/auth-token=([^;]+)/)
        return match ? match[1] : null
      }
    } else {
      const error = await response.json()
      console.log('❌ Échec connexion:', error)
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error)
  }
  return null
}

async function testCriticalAPIs(token: string) {
  console.log('\n📋 Étape 4: Test des APIs critiques...')
  
  const apis = [
    { name: 'Stats', url: '/api/dashboard/stats' },
    { name: 'Activity', url: '/api/dashboard/activity' },
    { name: 'Notifications', url: '/api/notifications' }
  ]

  let successCount = 0
  
  for (const api of apis) {
    try {
      console.log(`🔍 Test ${api.name}...`)
      
      const response = await fetch(`${APP_URL}${api.url}`, {
        headers: { 'Cookie': `auth-token=${token}` }
      })
      
      if (response.ok) {
        console.log(`✅ ${api.name} - Status 200`)
        successCount++
      } else {
        console.log(`❌ ${api.name} - Status ${response.status}`)
        const text = await response.text()
        console.log(`   Error: ${text.substring(0, 100)}...`)
      }
    } catch (error) {
      console.log(`❌ ${api.name} - Erreur: ${error}`)
    }
  }
  
  console.log(`\n📊 RÉSULTAT: ${successCount}/${apis.length} APIs critiques fonctionnelles`)
  return successCount === apis.length
}

async function main() {
  console.log('🎯 CORRECTION SIMPLE SUPABASE')
  console.log('=' .repeat(50))
  
  // Attendre que le déploiement soit actif
  console.log('⏳ Attente déploiement (30 secondes)...')
  await new Promise(resolve => setTimeout(resolve, 30000))
  
  // 1. Corriger RLS
  const fixed = await testSimpleFix()
  if (!fixed) {
    console.log('\n❌ Échec correction - Arrêt')
    return
  }
  
  // 2. Créer admin
  const credentials = await createAdminClean()
  if (!credentials) {
    console.log('\n❌ Échec création admin - Arrêt')
    return
  }
  
  // 3. Test connexion
  const token = await testLogin(credentials)
  if (!token) {
    console.log('\n❌ Échec connexion - Arrêt')
    return
  }
  
  // 4. Test APIs critiques
  const success = await testCriticalAPIs(token)
  
  // Résultat final
  console.log('\n' + '=' .repeat(50))
  if (success) {
    console.log('🎉 PROBLÈMES SUPABASE RÉSOLUS !')
    console.log('✅ RLS désactivé')
    console.log('✅ Admin opérationnel') 
    console.log('✅ APIs critiques fonctionnelles')
    console.log('\n🌐 Testez maintenant: https://acge-zeta.vercel.app/login')
    console.log(`🔑 Email: ${credentials.email}`)
    console.log(`🔑 Mot de passe: ${credentials.password}`)
  } else {
    console.log('⚠️ Correction partielle - Certaines APIs ont encore des problèmes')
  }
}

main().catch(console.error)
