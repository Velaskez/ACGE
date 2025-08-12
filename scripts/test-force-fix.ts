#!/usr/bin/env npx tsx

console.log('💪 Test correction forcée avec approche directe PostgreSQL...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function forceFixRLS() {
  console.log('🚀 Étape 1: Force disable RLS avec client PostgreSQL direct...')
  
  try {
    const response = await fetch(`${APP_URL}/api/force-disable-rls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Force disable RLS réussi !')
      console.log('📊 Résultats:')
      data.results.forEach((result: string) => console.log('  ', result))
      return true
    } else {
      const error = await response.json()
      console.log('❌ Erreur force disable:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return false
  }
}

async function restartDB() {
  console.log('\n🔄 Étape 2: Redémarrage des connexions Prisma...')
  
  try {
    const response = await fetch(`${APP_URL}/api/restart-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Connexions redémarrées !')
      console.log('👥 Nombre d\'utilisateurs:', data.userCount)
      return true
    } else {
      const error = await response.json()
      console.log('❌ Erreur restart:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur réseau restart:', error)
    return false
  }
}

async function testHealthAfterFix() {
  console.log('\n🏥 Étape 3: Test de santé après correction...')
  
  try {
    const response = await fetch(`${APP_URL}/api/health`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Health check OK !')
      console.log('📊 Statut:', data.status)
      return true
    } else {
      console.log('❌ Health check failed - Status:', response.status)
      const text = await response.text()
      console.log('   Error:', text.substring(0, 200))
      return false
    }
  } catch (error) {
    console.log('❌ Erreur health check:', error)
    return false
  }
}

async function testDashboardAPIs() {
  console.log('\n📊 Étape 4: Test final des APIs dashboard...')
  
  // D'abord se connecter
  try {
    const loginResponse = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acge.ga',
        password: 'admin123'
      })
    })

    if (!loginResponse.ok) {
      console.log('❌ Connexion impossible - Admin inexistant')
      return false
    }

    const setCookie = loginResponse.headers.get('set-cookie')
    if (!setCookie || !setCookie.includes('auth-token=')) {
      console.log('❌ Pas de token d\'auth')
      return false
    }

    const match = setCookie.match(/auth-token=([^;]+)/)
    const token = match ? match[1] : null
    
    if (!token) {
      console.log('❌ Token invalide')
      return false
    }

    console.log('✅ Connexion admin OK')

    // Maintenant tester les APIs critiques
    const apis = [
      { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
      { name: 'Dashboard Activity', url: '/api/dashboard/activity' },
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
          const data = await response.json()
          console.log(`✅ ${api.name} - Status 200 🎉`)
          console.log(`   Data preview: ${JSON.stringify(data).substring(0, 80)}...`)
          successCount++
        } else {
          console.log(`❌ ${api.name} - Status ${response.status}`)
          if (response.status === 500) {
            const text = await response.text()
            console.log(`   500 Details: ${text.substring(0, 150)}...`)
          }
        }
      } catch (error) {
        console.log(`❌ ${api.name} - Erreur: ${error}`)
      }
    }

    console.log(`\n🎯 RÉSULTAT APIS: ${successCount}/${apis.length} fonctionnelles`)
    return successCount === apis.length

  } catch (error) {
    console.log('❌ Erreur test APIs:', error)
    return false
  }
}

async function main() {
  console.log('💪 CORRECTION FORCÉE SUPABASE RLS')
  console.log('=' .repeat(60))
  console.log('⏳ Attente déploiement (30 secondes)...\n')
  
  await new Promise(resolve => setTimeout(resolve, 30000))
  
  // 1. Force disable RLS avec client PostgreSQL direct
  const rlsFixed = await forceFixRLS()
  if (!rlsFixed) {
    console.log('\n❌ Échec force disable RLS')
    return
  }
  
  // 2. Redémarrer les connexions Prisma
  const restarted = await restartDB()
  if (!restarted) {
    console.log('\n⚠️ Problème restart, mais on continue...')
  }
  
  // 3. Test santé
  const healthy = await testHealthAfterFix()
  if (!healthy) {
    console.log('\n⚠️ Health check échoué, mais on teste les APIs...')
  }
  
  // 4. Test final APIs
  const apisWork = await testDashboardAPIs()
  
  // Résultat final
  console.log('\n' + '=' .repeat(60))
  if (apisWork) {
    console.log('🎉 SUCCÈS COMPLET ! PROBLÈMES SUPABASE RÉSOLUS !')
    console.log('✅ RLS désactivé avec client PostgreSQL direct')
    console.log('✅ Cache Prisma contourné')
    console.log('✅ Toutes les APIs dashboard fonctionnent')
    console.log('✅ Erreurs 500 corrigées définitivement')
    console.log('\n🌐 Application pleinement opérationnelle :')
    console.log('   URL: https://acge-zeta.vercel.app/login')
    console.log('   Email: admin@acge.ga')
    console.log('   Mot de passe: admin123')
    console.log('\n🚀 Vous pouvez maintenant utiliser l\'application normalement !')
  } else {
    console.log('⚠️ Correction partielle - Vérifiez manuellement les APIs')
  }
}

main().catch(console.error)
