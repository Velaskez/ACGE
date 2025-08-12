/**
 * Test des endpoints simples
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function testSimpleEndpoints() {
  console.log('🧪 Test des endpoints simples...\n')

  const endpoints = [
    '/api/health',
    '/api/debug-env',
    '/login',
    '/'
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Test: ${endpoint}`)
      const response = await fetch(`${APP_URL}${endpoint}`)
      console.log(`   Status: ${response.status}`)
      
      if (response.ok && endpoint.startsWith('/api/')) {
        try {
          const data = await response.json()
          console.log(`   ✅ JSON:`, JSON.stringify(data, null, 2).substring(0, 200) + '...')
        } catch {
          console.log(`   📄 Not JSON response`)
        }
      } else if (response.status === 404 && endpoint.startsWith('/api/')) {
        console.log(`   ❌ Endpoint non trouvé`)
      }
      
    } catch (error) {
      console.log(`   ❌ Erreur:`, error)
    }
    console.log('')
  }
}

testSimpleEndpoints()
