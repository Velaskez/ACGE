// Test final complet avec JWT unifié

const API_URL = 'http://localhost:3000'

async function testFinalFlow() {
  console.log('🚀 Testing final API flow with unified JWT...\n')
  
  try {
    // 1. Test login
    console.log('1. Testing login with unified JWT secret...')
    const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    })
    
    console.log(`   Status: ${loginResponse.status}`)
    
    if (!loginResponse.ok) {
      const error = await loginResponse.text()
      console.log('❌ Login failed:', error)
      return
    }
    
    const setCookieHeader = loginResponse.headers.get('set-cookie')
    const tokenMatch = setCookieHeader?.match(/auth-token=([^;]+)/)
    const token = tokenMatch?.[1]
    
    if (!token) {
      console.log('❌ No auth token received')
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login successful!')
    console.log(`   User: ${loginData.user.email} (${loginData.user.role})`)
    console.log(`   Token: ${token.substring(0, 20)}...`)
    
    // 2. Test tous les endpoints problématiques
    const endpoints = [
      { url: '/api/dashboard/stats', name: 'Dashboard Stats' },
      { url: '/api/dashboard/activity', name: 'Dashboard Activity' },
      { url: '/api/sidebar/folders', name: 'Sidebar Folders' }
    ]
    
    console.log('\n2. Testing API endpoints...')
    
    for (const endpoint of endpoints) {
      console.log(`\n   Testing ${endpoint.name}...`)
      
      const response = await fetch(`${API_URL}${endpoint.url}`, {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      })
      
      console.log(`   Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ ${endpoint.name} - SUCCESS`)
        
        // Afficher des détails spécifiques
        if (endpoint.url.includes('stats')) {
          console.log(`      - Documents: ${data.totalDocuments || 0}`)
          console.log(`      - Folders: ${data.totalFolders || 0}`)
          console.log(`      - Users: ${data.totalUsers || 0}`)
          console.log(`      - Space used: ${data.spaceUsed?.gb || 0} GB`)
        } else if (endpoint.url.includes('activity')) {
          console.log(`      - Activities: ${data.activities?.length || 0}`)
        } else if (endpoint.url.includes('folders')) {
          console.log(`      - Folders: ${data.folders?.length || 0}`)
        }
      } else {
        const error = await response.text()
        console.log(`   ❌ ${endpoint.name} - FAILED`)
        console.log(`      Error: ${error.substring(0, 100)}...`)
      }
    }
    
    console.log('\n🎉 All tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFinalFlow().catch(console.error)
