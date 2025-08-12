/**
 * Script pour créer un utilisateur admin en production
 * Usage: npx tsx scripts/create-production-admin.ts
 */

const PRODUCTION_URL = 'https://acge-zeta.vercel.app'

async function createProductionAdmin() {
  try {
    console.log('🔧 Création d\'un utilisateur admin en production...')
    
    // Test de l'API de santé
    console.log('\n1️⃣ Test de connexion...')
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health`)
    console.log(`Status: ${healthResponse.status}`)
    
    if (healthResponse.status === 200) {
      console.log('✅ Application accessible')
    } else {
      console.log('❌ Application non accessible')
      return
    }
    
    // Tentative de création d'admin via l'API force-admin
    console.log('\n2️⃣ Tentative de création d\'admin...')
    const adminResponse = await fetch(`${PRODUCTION_URL}/api/force-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin ACGE',
        email: 'admin@acge.com',
        password: 'admin123456'  // À changer après première connexion
      })
    })
    
    const result = await adminResponse.json()
    console.log(`Status: ${adminResponse.status}`)
    console.log('Response:', result)
    
    if (adminResponse.status === 201) {
      console.log('\n✅ Utilisateur admin créé avec succès!')
      console.log('📧 Email: admin@acge.com')
      console.log('🔑 Mot de passe: admin123456')
      console.log('⚠️  IMPORTANT: Changez le mot de passe après première connexion!')
    }
    
    console.log('\n🌐 Accédez à votre application:')
    console.log(`   👉 ${PRODUCTION_URL}`)
    console.log(`   👉 ${PRODUCTION_URL}/login`)
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

createProductionAdmin()
