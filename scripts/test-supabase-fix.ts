#!/usr/bin/env npx tsx

console.log('🔧 Test de la correction Supabase...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function testSupabaseFix() {
  console.log('📋 Étape 1: Test de correction RLS Supabase...')
  
  try {
    const response = await fetch(`${APP_URL}/api/fix-supabase-rls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Correction RLS réussie !')
      console.log('📊 Résultats:', JSON.stringify(data, null, 2))
      return true
    } else {
      const error = await response.json()
      console.log('❌ Erreur correction RLS:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur réseau RLS:', error)
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
      console.log('👤 Détails admin:', data.admin)
      console.log('🔑 Identifiants:', data.credentials)
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
      if (setCookie) {
        const match = setCookie.match(/auth-token=([^;]+)/)
        if (match) {
          const token = match[1]
          console.log('✅ Connexion réussie !')
          console.log('🎫 Token obtenu:', token.substring(0, 50) + '...')
          return token
        }
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

async function testAPIs(token: string) {
  console.log('\n📋 Étape 4: Test des APIs problématiques...')
  
  const apis = [
    { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
    { name: 'Dashboard Activity', url: '/api/dashboard/activity' },
    { name: 'Notifications', url: '/api/notifications' },
    { name: 'Health', url: '/api/health' }
  ]

  let successCount = 0
  
  for (const api of apis) {
    try {
      console.log(`🔍 Test ${api.name}...`)
      
      const response = await fetch(`${APP_URL}${api.url}`, {
        headers: { 'Cookie': `auth-token=${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${api.name} - Status 200 (${JSON.stringify(data).length} chars)`)
        successCount++
      } else {
        console.log(`❌ ${api.name} - Status ${response.status}`)
      }
    } catch (error) {
      console.log(`❌ ${api.name} - Erreur: ${error}`)
    }
  }
  
  console.log(`\n📊 RÉSULTAT: ${successCount}/${apis.length} APIs fonctionnelles`)
  return successCount === apis.length
}

async function main() {
  console.log('🎯 CORRECTION COMPLÈTE DES PROBLÈMES SUPABASE')
  console.log('=' .repeat(60))
  
  // 1. Corriger RLS
  const rlsFixed = await testSupabaseFix()
  if (!rlsFixed) {
    console.log('\n❌ Échec correction RLS - Arrêt du processus')
    return
  }
  
  // 2. Créer admin
  const credentials = await createAdminClean()
  if (!credentials) {
    console.log('\n❌ Échec création admin - Arrêt du processus')
    return
  }
  
  // 3. Test connexion
  const token = await testLogin(credentials)
  if (!token) {
    console.log('\n❌ Échec connexion - Arrêt du processus')
    return
  }
  
  // 4. Test APIs
  const apisWork = await testAPIs(token)
  
  // 5. Résultat final
  console.log('\n' + '=' .repeat(60))
  if (apisWork) {
    console.log('🎉 SUCCÈS COMPLET !')
    console.log('✅ Problèmes Supabase résolus')
    console.log('✅ Row Level Security désactivé') 
    console.log('✅ Admin fonctionnel')
    console.log('✅ Toutes les APIs opérationnelles')
    console.log('\n🌐 Application prête :')
    console.log(`URL: ${APP_URL}/login`)
    console.log(`Email: ${credentials.email}`)
    console.log(`Mot de passe: ${credentials.password}`)
  } else {
    console.log('⚠️ Correction partielle - Certaines APIs ont encore des problèmes')
  }
}

main().catch(console.error)
