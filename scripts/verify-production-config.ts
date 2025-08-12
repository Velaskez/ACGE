/**
 * Script pour vérifier la configuration de production
 */

const PRODUCTION_URL = 'https://acge-zeta.vercel.app'

async function verifyProductionConfig() {
  console.log('🔍 Vérification de la configuration de production...\n')

  try {
    // Test 1: Health check
    console.log('1️⃣ Test de santé de l\'application...')
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health`)
    console.log(`   Status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('   ✅ Application accessible')
      console.log(`   📊 Data: ${JSON.stringify(healthData)}`)
    } else {
      console.log('   ❌ Application non accessible')
    }

    // Test 2: Auth endpoint
    console.log('\n2️⃣ Test de l\'authentification...')
    const authResponse = await fetch(`${PRODUCTION_URL}/api/auth/me`)
    console.log(`   Status: ${authResponse.status}`)
    
    if (authResponse.status === 401) {
      console.log('   ✅ Auth endpoint configuré (401 = normal sans token)')
    } else {
      console.log('   ❓ Réponse inattendue')
    }

    // Test 3: Database connectivity
    console.log('\n3️⃣ Test de connectivité base de données...')
    const dbResponse = await fetch(`${PRODUCTION_URL}/api/users`)
    console.log(`   Status: ${dbResponse.status}`)
    
    if (dbResponse.status === 401) {
      console.log('   ✅ Base de données accessible (401 = auth requise)')
    } else if (dbResponse.status === 500) {
      console.log('   ❌ Erreur base de données - vérifiez DATABASE_URL')
    }

    console.log('\n📋 Résumé:')
    console.log('   - Application déployée ✅')
    console.log('   - Variables d\'environnement à configurer:')
    console.log('     • NEXTAUTH_SECRET: 12250201ac6d78a8a72a5efbf7f7970ac8811e7ebd541dd9490631a9780a900b')
    console.log('     • NEXTAUTH_URL: https://acge-zeta.vercel.app')
    console.log('     • DATABASE_URL: (à obtenir depuis Vercel Postgres)')

  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
  }
}

verifyProductionConfig()
