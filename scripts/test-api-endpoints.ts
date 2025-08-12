// Test des endpoints API
import crypto from 'crypto'
import { sign } from 'jsonwebtoken'

const API_URL = 'http://localhost:3000'
const SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here-change-in-production'

async function generateTestToken(userId: string) {
  const token = sign(
    { userId, email: 'admin@test.com', role: 'ADMIN' },
    SECRET,
    { expiresIn: '24h' }
  )
  return token
}

async function testLogin() {
  console.log('\n📝 Testing login endpoint...')
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Login successful!')
      return data.token
    } else {
      console.log('❌ Login failed:', data.error)
      return null
    }
  } catch (error) {
    console.error('❌ Login request failed:', error)
    return null
  }
}

async function testAPIEndpoint(endpoint: string, token: string) {
  console.log(`\n📝 Testing ${endpoint}...`)
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ ${endpoint} responded successfully`)
      console.log('Response sample:', JSON.stringify(data).substring(0, 200) + '...')
      return true
    } else {
      const errorText = await response.text()
      console.log(`❌ ${endpoint} failed with status ${response.status}`)
      console.log('Error:', errorText.substring(0, 200))
      return false
    }
  } catch (error) {
    console.error(`❌ ${endpoint} request failed:`, error)
    return false
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...')
  
  // Tester le login
  const token = await testLogin()
  
  if (!token) {
    // Si le login échoue, générer un token directement
    console.log('\n⚠️ Login failed, generating direct token...')
    
    // Obtenir l'ID de l'utilisateur admin depuis la DB
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      const adminUser = await prisma.user.findFirst({
        where: { email: 'admin@test.com' }
      })
      
      if (adminUser) {
        const directToken = await generateTestToken(adminUser.id)
        console.log('✅ Direct token generated')
        
        // Tester les endpoints avec le token direct
        await testAPIEndpoint('/api/dashboard/stats', directToken)
        await testAPIEndpoint('/api/dashboard/activity', directToken)
        await testAPIEndpoint('/api/sidebar/folders', directToken)
      } else {
        console.error('❌ Admin user not found in database')
      }
      
      await prisma.$disconnect()
    } catch (error) {
      console.error('❌ Database error:', error)
      await prisma.$disconnect()
    }
  } else {
    // Tester les endpoints avec le token du login
    await testAPIEndpoint('/api/dashboard/stats', token)
    await testAPIEndpoint('/api/dashboard/activity', token)
    await testAPIEndpoint('/api/sidebar/folders', token)
  }
  
  console.log('\n✅ API tests completed!')
}

runTests().catch(console.error)
