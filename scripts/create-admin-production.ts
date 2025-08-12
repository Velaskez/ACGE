/**
 * Script pour créer l'utilisateur admin en production
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function createAdminProduction() {
  console.log('🔧 Création de l\'utilisateur admin pour ACGE...\n')

  const adminData = {
    name: 'Administrateur ACGE',
    email: 'admin@acge.ga',
    password: 'admin123'
  }

  try {
    // Essayer l'endpoint setup-admin
    console.log('🚀 Création de l\'admin via setup-admin...')
    const response = await fetch(`${APP_URL}/api/setup-admin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(adminData)
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Utilisateur admin créé avec succès!')
      console.log('📊 Détails:', result)
    } else {
      // Essayer avec l'endpoint users direct
      console.log('\n🔄 Essai avec l\'endpoint users...')
      const usersResponse = await fetch(`${APP_URL}/api/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...adminData,
          role: 'ADMIN'
        })
      })
      
      console.log(`Status users: ${usersResponse.status}`)
      
      if (usersResponse.ok) {
        const userResult = await usersResponse.json()
        console.log('✅ Admin créé via endpoint users!')
        console.log('📊 Détails:', userResult)
      } else {
        const errorText = await response.text()
        console.log('❌ Erreur:', errorText)
      }
    }

    console.log('\n🎯 Identifiants de connexion:')
    console.log('📧 Email:', adminData.email)
    console.log('🔑 Mot de passe:', adminData.password)
    console.log('🌐 URL:', `${APP_URL}/login`)

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  }
}

createAdminProduction()
