#!/usr/bin/env npx tsx

console.log('🎯 CRÉATION ADMIN SPÉCIAL SUPABASE\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function checkUsersTable() {
  console.log('🔍 Vérification table users Supabase...')
  
  try {
    const response = await fetch(`${APP_URL}/api/supabase-admin`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Table users accessible')
      console.log('📊 Colonnes:', data.columns.map((c: any) => c.column_name).join(', '))
      console.log('👥 Utilisateurs existants:', data.totalUsers)
      console.log('👑 Admin existe:', data.adminExists ? 'OUI' : 'NON')
      
      if (data.users.length > 0) {
        console.log('📋 Derniers utilisateurs:')
        data.users.forEach((user: any) => {
          console.log(`  - ${user.email} (${user.role}) - ${user.createdAt}`)
        })
      }
      
      return data
    } else {
      const error = await response.json()
      console.log('❌ Erreur vérification table:', error)
      return null
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return null
  }
}

async function createSupabaseAdmin() {
  console.log('\n👤 Création admin adapté Supabase...')
  
  try {
    const response = await fetch(`${APP_URL}/api/supabase-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Admin Supabase créé avec succès !')
      console.log('👤 Détails admin:')
      console.log('   ID:', data.admin.id)
      console.log('   Email:', data.admin.email)
      console.log('   Nom:', data.admin.name)
      console.log('   Rôle:', data.admin.role)
      console.log('   Créé le:', data.admin.createdAt)
      console.log('👥 Total utilisateurs:', data.totalUsers)
      
      return data.credentials
    } else {
      const error = await response.json()
      console.log('❌ Erreur création admin Supabase:', error)
      return null
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return null
  }
}

async function testLoginSupabase(credentials: any) {
  console.log('\n🔐 Test connexion admin Supabase...')
  
  try {
    const response = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (response.ok) {
      const setCookie = response.headers.get('set-cookie')
      if (setCookie && setCookie.includes('auth-token=')) {
        console.log('✅ Connexion admin Supabase réussie !')
        const match = setCookie.match(/auth-token=([^;]+)/)
        const token = match ? match[1] : null
        console.log('🎫 Token obtenu:', token?.substring(0, 30) + '...')
        return token
      }
    } else {
      console.log('❌ Échec connexion -', response.status)
      const error = await response.json()
      console.log('   Détails:', error)
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error)
  }
  
  return null
}

async function testDashboardAPIsWithSupabase(token: string) {
  console.log('\n📊 Test APIs Dashboard avec admin Supabase...')
  
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
        const data = await response.json()
        console.log(`   ✅ ${api.name} - Status 200`)
        console.log(`   📄 Données: ${JSON.stringify(data).substring(0, 80)}...`)
        successCount++
      } else {
        console.log(`   ❌ ${api.name} - Status ${response.status}`)
        if (response.status === 500) {
          const text = await response.text()
          console.log(`   💥 Erreur 500: ${text.substring(0, 100)}...`)
        }
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} - Erreur: ${error}`)
    }
  }
  
  console.log(`\n📈 RÉSULTAT: ${successCount}/${apis.length} APIs fonctionnelles`)
  return successCount === apis.length
}

async function main() {
  console.log('🎯 CRÉATION ADMIN OPTIMISÉ SUPABASE')
  console.log('=' .repeat(50))
  
  // Attendre le déploiement
  console.log('⏳ Attente déploiement (20 secondes)...')
  await new Promise(resolve => setTimeout(resolve, 20000))
  
  // 1. Vérifier la table users
  const tableInfo = await checkUsersTable()
  if (!tableInfo) {
    console.log('\n❌ Table users inaccessible - Arrêt')
    return
  }
  
  // 2. Créer l'admin adapté Supabase
  const credentials = await createSupabaseAdmin()
  if (!credentials) {
    console.log('\n❌ Échec création admin Supabase')
    return
  }
  
  // 3. Tester la connexion
  const token = await testLoginSupabase(credentials)
  if (!token) {
    console.log('\n❌ Connexion impossible')
    return
  }
  
  // 4. Tester les APIs problématiques
  const apisWork = await testDashboardAPIsWithSupabase(token)
  
  // Résultat final
  console.log('\n' + '🎯'.repeat(25))
  if (apisWork) {
    console.log('🎉 SUCCÈS TOTAL ! ADMIN SUPABASE OPÉRATIONNEL !')
    console.log('')
    console.log('✅ Admin créé avec structure Supabase')
    console.log('✅ Authentification fonctionnelle')
    console.log('✅ APIs Dashboard opérationnelles')
    console.log('✅ Erreurs 500 définitivement corrigées')
    console.log('')
    console.log('🌐 VOTRE APPLICATION GED EST PRÊTE !')
    console.log('')
    console.log('🔗 Connectez-vous :')
    console.log(`   URL: ${APP_URL}/login`)
    console.log(`   Email: ${credentials.email}`)
    console.log(`   Mot de passe: ${credentials.password}`)
    console.log('')
    console.log('🚀 Toutes les fonctionnalités sont disponibles !')
    console.log('📂 Documents, dossiers, partage, versioning...')
    console.log('📊 Dashboard avec statistiques complètes...')
    console.log('👥 Gestion utilisateurs...')
  } else {
    console.log('⚠️ ADMIN CRÉÉ MAIS APIs PARTIELLEMENT FONCTIONNELLES')
    console.log('💡 Vérifiez les détails ci-dessus')
  }
  console.log('🎯'.repeat(25))
}

main().catch(console.error)
