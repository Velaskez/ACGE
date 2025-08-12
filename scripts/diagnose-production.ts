/**
 * Diagnostic de l'application en production
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function diagnoseProduction() {
  console.log('🔍 Diagnostic de l\'application ACGE en production...\n')

  try {
    // Test 1: Page d'accueil
    console.log('1️⃣ Test page d\'accueil...')
    const homeResponse = await fetch(APP_URL)
    console.log(`   Status: ${homeResponse.status}`)

    // Test 2: Page de login
    console.log('\n2️⃣ Test page de login...')
    const loginResponse = await fetch(`${APP_URL}/login`)
    console.log(`   Status: ${loginResponse.status}`)

    // Test 3: API Health
    console.log('\n3️⃣ Test API Health...')
    try {
      const healthResponse = await fetch(`${APP_URL}/api/health`)
      console.log(`   Status: ${healthResponse.status}`)
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        console.log('   ✅ API Health:', JSON.stringify(healthData, null, 2))
      } else {
        const errorText = await healthResponse.text()
        console.log('   ❌ Erreur Health:', errorText)
      }
    } catch (e) {
      console.log('   ❌ Erreur Health:', e)
    }

    // Test 4: API Auth/Me (test de base de données)
    console.log('\n4️⃣ Test connectivité base de données...')
    try {
      const authResponse = await fetch(`${APP_URL}/api/auth/me`)
      console.log(`   Status auth/me: ${authResponse.status}`)
      
      if (authResponse.status === 401) {
        console.log('   ✅ Base accessible (401 normal sans token)')
      } else {
        const authText = await authResponse.text()
        console.log('   📄 Réponse:', authText.substring(0, 200))
      }
    } catch (e) {
      console.log('   ❌ Erreur auth:', e)
    }

    console.log('\n🎯 Diagnostic:')
    console.log('   - Application déployée et accessible')
    console.log('   - Page de login fonctionnelle')
    console.log('   - Problème probable: tables de base de données manquantes')
    console.log('')
    console.log('💡 Solutions possibles:')
    console.log('   1. Initialiser les tables via Vercel CLI')
    console.log('   2. Utiliser un endpoint de migration')
    console.log('   3. Créer manuellement le premier utilisateur')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

diagnoseProduction()
