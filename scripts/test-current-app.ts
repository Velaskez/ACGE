/**
 * Test rapide de l'application actuelle
 */

// URL basée sur l'inspect link du déploiement précédent
const APP_URL = 'https://acge-zeta.vercel.app'

async function testCurrentApp() {
  console.log('🧪 Test rapide de l\'application ACGE...\n')

  try {
    // Test création admin
    console.log('🔧 Création d\'un utilisateur admin...')
    const adminResponse = await fetch(`${APP_URL}/api/force-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin ACGE',
        email: 'admin@acge.com',
        password: 'admin123456'
      })
    })
    
    console.log(`Status: ${adminResponse.status}`)
    
    if (adminResponse.ok) {
      const result = await adminResponse.json()
      console.log('✅ Utilisateur admin créé avec succès!')
      console.log('📧 Email: admin@acge.com')
      console.log('🔑 Mot de passe: admin123456')
    } else if (adminResponse.status === 409) {
      console.log('✅ Admin existe déjà!')
    } else {
      const error = await adminResponse.text()
      console.log(`❌ Erreur: ${error}`)
    }

    console.log(`\n🌐 Application: ${APP_URL}`)
    console.log(`🔐 Login: ${APP_URL}/login`)
    
    console.log('\n🎯 Fonctionnalités disponibles:')
    console.log('   📊 Dashboard avec statistiques')
    console.log('   📁 Gestion des dossiers')
    console.log('   📄 Gestion des documents') 
    console.log('   🔍 Recherche avancée')
    console.log('   👥 Partage de documents')
    console.log('   🔄 Historique des versions')
    console.log('   👤 Gestion des profils')
    console.log('   🔔 Notifications en temps réel')
    console.log('   👨‍💼 Gestion des utilisateurs')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testCurrentApp()
