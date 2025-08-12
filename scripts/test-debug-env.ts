/**
 * Test du debug environnement
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function testDebugEnv() {
  console.log('🔍 Test debug environnement...\n')

  try {
    // Attendre le redéploiement
    console.log('⏳ Attente redéploiement (20 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 20000))

    const response = await fetch(`${APP_URL}/api/debug-env`)
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Debug environnement:', JSON.stringify(data, null, 2))
      
      if (data.dbUrlType === 'PostgreSQL') {
        console.log('✅ PostgreSQL détecté!')
      } else {
        console.log('❌ PostgreSQL NON détecté:', data.dbUrlType)
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Erreur debug:', errorText)
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testDebugEnv()
