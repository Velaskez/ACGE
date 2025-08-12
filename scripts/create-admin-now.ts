#!/usr/bin/env npx tsx

console.log('👤 Création admin immédiate...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function createAdmin() {
  console.log('🚀 Création admin avec PostgreSQL direct...')
  
  try {
    const response = await fetch(`${APP_URL}/api/create-admin-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Admin créé avec succès !')
      console.log('👤 Email:', data.admin.email)
      console.log('🆔 ID:', data.admin.id)
      console.log('👑 Rôle:', data.admin.role)
      console.log('📅 Créé le:', data.admin.createdAt)
      console.log('👥 Total utilisateurs:', data.totalUsers)
      console.log('')
      console.log('🔑 IDENTIFIANTS DE CONNEXION:')
      console.log('   Email:', data.credentials.email)
      console.log('   Mot de passe:', data.credentials.password)
      return data.credentials
    } else {
      const error = await response.json()
      console.log('❌ Erreur création admin:', error)
      return null
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return null
  }
}

async function testLogin(credentials: any) {
  console.log('\n🔐 Test de connexion immédiat...')
  
  try {
    const response = await fetch(`${APP_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (response.ok) {
      console.log('✅ Connexion réussie !')
      console.log('🎫 Token d\'authentification obtenu')
      return true
    } else {
      console.log('❌ Échec connexion -', response.status)
      const error = await response.json()
      console.log('   Détails:', error)
      return false
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error)
    return false
  }
}

async function main() {
  console.log('👤 CRÉATION UTILISATEUR ADMIN')
  console.log('=' .repeat(40))
  
  // Attendre un peu pour s'assurer que le déploiement est actif
  console.log('⏳ Attente déploiement (15 secondes)...')
  await new Promise(resolve => setTimeout(resolve, 15000))
  
  // 1. Créer l'admin
  const credentials = await createAdmin()
  if (!credentials) {
    console.log('\n❌ Échec création admin')
    return
  }
  
  // 2. Tester la connexion
  const loginOk = await testLogin(credentials)
  
  // Résultat
  console.log('\n' + '=' .repeat(40))
  if (loginOk) {
    console.log('🎉 ADMIN CRÉÉ ET OPÉRATIONNEL !')
    console.log('')
    console.log('🌐 Connectez-vous maintenant :')
    console.log(`   URL: ${APP_URL}/login`)
    console.log(`   Email: ${credentials.email}`)
    console.log(`   Mot de passe: ${credentials.password}`)
    console.log('')
    console.log('✅ Prêt pour tester les APIs dashboard !')
  } else {
    console.log('⚠️ Admin créé mais problème de connexion')
    console.log('💡 Vérifiez manuellement sur l\'application')
  }
}

main().catch(console.error)
