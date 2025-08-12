// Script de vérification de santé de l'application
// À utiliser pour diagnostiquer rapidement les problèmes

import { PrismaClient } from '@prisma/client'
import { sign, verify } from 'jsonwebtoken'

const API_URL = 'http://localhost:3000'
const prisma = new PrismaClient()

async function healthCheck() {
  console.log('🏥 ACGE Application Health Check\n')
  
  let allChecksPass = true
  
  // 1. Vérifier les variables d'environnement
  console.log('1. 🔧 Environment Variables Check')
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: ${process.env[envVar]?.substring(0, 30)}...`)
    } else {
      console.log(`   ❌ ${envVar}: NOT SET`)
      allChecksPass = false
    }
  }
  
  // 2. Vérifier la connexion à la base de données
  console.log('\n2. 🗄️ Database Connection Check')
  try {
    const userCount = await prisma.user.count()
    console.log(`   ✅ Database connected - Users: ${userCount}`)
    
    const [docCount, folderCount] = await Promise.all([
      prisma.document.count(),
      prisma.folder.count()
    ])
    console.log(`   📊 Data: ${docCount} documents, ${folderCount} folders`)
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error}`)
    allChecksPass = false
  }
  
  // 3. Vérifier JWT
  console.log('\n3. 🔐 JWT Configuration Check')
  try {
    const secret = process.env.NEXTAUTH_SECRET || 'fallback'
    const testToken = sign({ test: true }, secret, { expiresIn: '1h' })
    const decoded = verify(testToken, secret)
    console.log(`   ✅ JWT working correctly`)
  } catch (error) {
    console.log(`   ❌ JWT configuration issue: ${error}`)
    allChecksPass = false
  }
  
  // 4. Vérifier les endpoints API
  console.log('\n4. 🌐 API Endpoints Check')
  
  try {
    // Test si le serveur répond
    const healthResponse = await fetch(`${API_URL}/api/health`).catch(() => null)
    
    if (!healthResponse) {
      console.log(`   ❌ Server not responding on ${API_URL}`)
      console.log(`   💡 Make sure to run: npm run dev`)
      allChecksPass = false
    } else {
      console.log(`   ✅ Server responding on ${API_URL}`)
      
      // Test login si le serveur répond
      const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
      })
      
      if (loginResponse.ok) {
        console.log(`   ✅ Login endpoint working`)
      } else {
        console.log(`   ❌ Login endpoint failed: ${loginResponse.status}`)
        allChecksPass = false
      }
    }
  } catch (error) {
    console.log(`   ❌ API check failed: ${error}`)
    allChecksPass = false
  }
  
  // 5. Résumé final
  console.log('\n📊 Health Check Summary')
  if (allChecksPass) {
    console.log('🎉 All checks passed! Application is healthy.')
  } else {
    console.log('⚠️ Some checks failed. Please review the issues above.')
    console.log('\n🔧 Quick fixes:')
    console.log('   - Check .env.local file exists and has correct values')
    console.log('   - Run: npx prisma db push')
    console.log('   - Run: npm run dev')
    console.log('   - Check that all required dependencies are installed')
  }
  
  await prisma.$disconnect()
}

healthCheck().catch(console.error)
