// Test complet: login puis appel des APIs
const API_URL = 'http://localhost:3003'

async function testCompleteFlow() {
  console.log('🚀 Testing complete authentication flow...\n')
  
  // 1. Tester le login
  console.log('1. Testing login...')
  const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    })
  })
  
  if (!loginResponse.ok) {
    const error = await loginResponse.text()
    console.log('❌ Login failed:', error)
    return
  }
  
  // Récupérer le cookie auth-token
  const setCookieHeader = loginResponse.headers.get('set-cookie')
  const tokenMatch = setCookieHeader?.match(/auth-token=([^;]+)/)
  const token = tokenMatch?.[1]
  
  if (!token) {
    console.log('❌ No auth token in response')
    return
  }
  
  const loginData = await loginResponse.json()
  console.log('✅ Login successful!')
  console.log('   User:', loginData.user.email)
  console.log('   Role:', loginData.user.role)
  console.log('')
  
  // 2. Tester les APIs avec le token
  const endpoints = [
    '/api/dashboard/stats',
    '/api/dashboard/activity', 
    '/api/sidebar/folders'
  ]
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`)
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ Success`)
      
      // Afficher un résumé des données
      if (endpoint.includes('stats')) {
        console.log(`   Documents: ${data.totalDocuments}`)
        console.log(`   Folders: ${data.totalFolders}`)
        console.log(`   Users: ${data.totalUsers}`)
      } else if (endpoint.includes('activity')) {
        console.log(`   Activities: ${data.activities?.length || 0}`)
      } else if (endpoint.includes('folders')) {
        console.log(`   Folders: ${data.folders?.length || 0}`)
      }
    } else {
      const error = await response.text()
      console.log(`❌ Failed (${response.status})`)
      console.log(`   Error:`, error.substring(0, 100))
    }
    console.log('')
  }
  
  console.log('✅ Test completed!')
}

testCompleteFlow().catch(console.error)
