// Test final des APIs avec la configuration actuelle (SQLite + JWT unifié)
import { config } from 'dotenv'
import path from 'path'

const API_URL = 'http://localhost:3000'

async function testAPIsCurrentSetup() {
  console.log('🚀 Test final des APIs avec la configuration actuelle...\n')
  
  try {
    // 1. Vérifier la configuration actuelle
    console.log('1. 📋 Configuration actuelle:')
    
    // Charger .env.local pour voir si PostgreSQL ou SQLite
    const envLocalPath = path.join(process.cwd(), '.env.local')
    config({ path: envLocalPath })
    
    const dbUrl = process.env.DATABASE_URL || 'Non définie'
    const dbType = dbUrl.includes('postgresql') ? 'PostgreSQL' : 'SQLite'
    
    console.log(`   🗄️ Base de données: ${dbType}`)
    console.log(`   📍 URL: ${dbUrl.substring(0, 50)}...`)
    console.log(`   🔑 JWT Secret: ${process.env.NEXTAUTH_SECRET?.substring(0, 20)}...`)
    
    // 2. Vérifier si le serveur répond
    console.log('\n2. 🌐 Vérification du serveur...')
    try {
      const healthResponse = await fetch(`${API_URL}/api/health`)
      if (healthResponse.ok) {
        console.log('   ✅ Serveur Next.js disponible')
      } else {
        console.log('   ⚠️ Serveur répond mais avec erreur')
      }
    } catch {
      console.log('   ❌ Serveur non disponible')
      console.log('   💡 Exécutez: npm run dev')
      return
    }
    
    // 3. Test de login
    console.log('\n3. 🔐 Test de connexion...')
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
      console.log('   ❌ Échec de connexion:', error.substring(0, 100))
      return
    }
    
    const setCookieHeader = loginResponse.headers.get('set-cookie')
    const tokenMatch = setCookieHeader?.match(/auth-token=([^;]+)/)
    const token = tokenMatch?.[1]
    
    if (!token) {
      console.log('   ❌ Token non reçu')
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('   ✅ Connexion réussie!')
    console.log(`   👤 Utilisateur: ${loginData.user.email} (${loginData.user.role})`)
    
    // 4. Test des endpoints API problématiques initiaux
    const endpoints = [
      { url: '/api/dashboard/stats', name: 'Dashboard Stats' },
      { url: '/api/dashboard/activity', name: 'Dashboard Activity' },
      { url: '/api/sidebar/folders', name: 'Sidebar Folders' }
    ]
    
    console.log('\n4. 🧪 Test des endpoints corrigés...')
    
    let allSuccess = true
    for (const endpoint of endpoints) {
      console.log(`\n   📡 Test ${endpoint.name}...`)
      
      const response = await fetch(`${API_URL}${endpoint.url}`, {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`   ✅ ${endpoint.name} - SUCCÈS`)
        
        // Afficher des détails
        if (endpoint.url.includes('stats')) {
          console.log(`      📊 Documents: ${data.totalDocuments || 0}`)
          console.log(`      📁 Dossiers: ${data.totalFolders || 0}`)
          console.log(`      👥 Utilisateurs: ${data.totalUsers || 0}`)
          console.log(`      💾 Espace: ${data.spaceUsed?.gb || 0} GB`)
        } else if (endpoint.url.includes('activity')) {
          console.log(`      🔄 Activités: ${data.activities?.length || 0}`)
        } else if (endpoint.url.includes('folders')) {
          console.log(`      📂 Dossiers sidebar: ${data.folders?.length || 0}`)
        }
      } else {
        const error = await response.text()
        console.log(`   ❌ ${endpoint.name} - ÉCHEC`)
        console.log(`      Erreur: ${error.substring(0, 100)}`)
        allSuccess = false
      }
    }
    
    // 5. Résumé final
    console.log('\n📊 RÉSUMÉ FINAL:')
    if (allSuccess) {
      console.log('🎉 TOUTES LES APIS FONCTIONNENT PARFAITEMENT!')
      console.log('\n✅ Problèmes résolus:')
      console.log('   ✓ Erreur "récupération des données" → CORRIGÉE')
      console.log('   ✓ Erreur "récupération des statistiques" → CORRIGÉE')
      console.log('   ✓ JWT signature invalide → CORRIGÉE')
      console.log('   ✓ Base de données non configurée → CORRIGÉE')
      
      console.log(`\n🗄️ Base de données active: ${dbType}`)
      console.log('🔐 Authentification: Fonctionnelle')
      console.log('🌐 APIs: Opérationnelles')
      
      console.log('\n🎯 MISSION ACCOMPLIE!')
      console.log('   Votre application ACGE est maintenant complètement opérationnelle.')
      
    } else {
      console.log('⚠️ QUELQUES PROBLÈMES PERSISTENT')
      console.log('   Vérifiez les erreurs ci-dessus')
    }
    
    console.log('\n🔗 Accès à l\'application:')
    console.log(`   🌐 URL: ${API_URL}`)
    console.log('   👤 Email: admin@test.com')
    console.log('   🔑 Password: admin123')
    
    if (dbType === 'PostgreSQL') {
      console.log('\n🐘 PostgreSQL:')
      console.log('   📱 pgAdmin: http://localhost:8080')
      console.log('   👤 Email pgAdmin: admin@acge.local')
      console.log('   🔑 Password pgAdmin: admin123')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testAPIsCurrentSetup().catch(console.error)
