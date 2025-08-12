/**
 * Test de toutes les APIs de l'application
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function testAllAPIs() {
  console.log('🔍 Test complet de toutes les APIs...\n')

  const apis = [
    { name: 'Health', url: '/api/health', method: 'GET' },
    { name: 'Dashboard Stats', url: '/api/dashboard/stats', method: 'GET' },
    { name: 'Dashboard Activity', url: '/api/dashboard/activity', method: 'GET' },
    { name: 'Documents', url: '/api/documents', method: 'GET' },
    { name: 'Folders', url: '/api/folders', method: 'GET' },
    { name: 'Users', url: '/api/users', method: 'GET' },
    { name: 'Auth Me', url: '/api/auth/me', method: 'GET' },
    { name: 'Notifications', url: '/api/notifications', method: 'GET' },
    { name: 'Sidebar Folders', url: '/api/sidebar/folders', method: 'GET' }
  ]

  for (const api of apis) {
    try {
      console.log(`📡 Test: ${api.name} (${api.method} ${api.url})`)
      
      const response = await fetch(`${APP_URL}${api.url}`, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`   Status: ${response.status}`)
      
      if (response.ok) {
        try {
          const data = await response.json()
          console.log(`   ✅ Réponse: ${JSON.stringify(data).substring(0, 100)}...`)
        } catch (e) {
          console.log(`   ✅ Réponse non-JSON (normal pour certains endpoints)`)
        }
      } else {
        const errorText = await response.text()
        console.log(`   ❌ Erreur: ${errorText.substring(0, 200)}`)
      }
      
      console.log('')
      
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`)
      console.log('')
    }
  }

  console.log('🎯 Analyse terminée!')
}

testAllAPIs()
