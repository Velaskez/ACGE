#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'

async function testUserSession() {
  console.log('👤 Test de gestion des sessions utilisateur')
  console.log('==========================================')
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣ Test connexion base de données...')
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // 2. Récupérer tous les utilisateurs
    console.log('\n2️⃣ Récupération des utilisateurs...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    console.log(`👥 ${users.length} utilisateur(s) trouvé(s):`)
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`)
    })
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur à tester')
      return
    }
    
    // 3. Tester la connexion avec chaque utilisateur
    console.log('\n3️⃣ Test de connexion avec chaque utilisateur...')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      console.log(`\n🔑 Test utilisateur ${i + 1}/${users.length}: ${user.email}`)
      
      // Utiliser des mots de passe de test
      const testPasswords = ['admin123', 'password123', 'test123', 'Reviti2025@']
      
      for (const password of testPasswords) {
        console.log(`   Tentative avec mot de passe: ${password}`)
        
        try {
          const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email,
              password: password
            })
          })
          
          console.log(`   📡 Status: ${loginResponse.status}`)
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            console.log(`   ✅ Connexion réussie!`)
            console.log(`   👤 Utilisateur connecté: ${loginData.user.email}`)
            console.log(`   🔐 Rôle: ${loginData.user.role}`)
            
            // Récupérer les cookies
            const cookies = loginResponse.headers.get('set-cookie')
            console.log(`   🍪 Cookie reçu: ${cookies ? 'Oui' : 'Non'}`)
            
            // 4. Tester l'endpoint /api/auth/me
            console.log(`   🔍 Test de l'endpoint /api/auth/me...`)
            
            const meResponse = await fetch(`${baseUrl}/api/auth/me`, {
              headers: {
                'Cookie': cookies || ''
              }
            })
            
            console.log(`   📡 Status /api/auth/me: ${meResponse.status}`)
            
            if (meResponse.ok) {
              const meData = await meResponse.json()
              console.log(`   ✅ Données utilisateur récupérées: ${meData.user.email}`)
              
              // Vérifier que c'est le bon utilisateur
              if (meData.user.email === user.email) {
                console.log(`   ✅ Session correcte pour ${user.email}`)
              } else {
                console.log(`   ❌ ERREUR: Session incorrecte! Attendu: ${user.email}, Reçu: ${meData.user.email}`)
              }
            } else {
              console.log(`   ❌ Erreur /api/auth/me`)
            }
            
            // 5. Tester l'endpoint /api/profile
            console.log(`   🔍 Test de l'endpoint /api/profile...`)
            
            const profileResponse = await fetch(`${baseUrl}/api/profile`, {
              headers: {
                'Cookie': cookies || ''
              }
            })
            
            console.log(`   📡 Status /api/profile: ${profileResponse.status}`)
            
            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              console.log(`   ✅ Profil récupéré: ${profileData.user.email}`)
              
              // Vérifier que c'est le bon utilisateur
              if (profileData.user.email === user.email) {
                console.log(`   ✅ Profil correct pour ${user.email}`)
              } else {
                console.log(`   ❌ ERREUR: Profil incorrect! Attendu: ${user.email}, Reçu: ${profileData.user.email}`)
              }
            } else {
              console.log(`   ❌ Erreur /api/profile`)
            }
            
            // 6. Test de déconnexion
            console.log(`   🚪 Test de déconnexion...`)
            
            const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
              method: 'POST',
              headers: {
                'Cookie': cookies || ''
              }
            })
            
            console.log(`   📡 Status logout: ${logoutResponse.status}`)
            
            if (logoutResponse.ok) {
              console.log(`   ✅ Déconnexion réussie`)
            } else {
              console.log(`   ❌ Erreur de déconnexion`)
            }
            
            break // Passer au prochain utilisateur
            
          } else {
            const errorData = await loginResponse.text()
            console.log(`   ❌ Échec de connexion: ${errorData}`)
          }
        } catch (error) {
          console.log(`   ❌ Erreur réseau: ${error.message}`)
        }
      }
    }
    
    // 7. Recommandations
    console.log('\n7️⃣ Recommandations...')
    console.log('✅ Test de gestion des sessions terminé')
    console.log('🔧 Vérifiez que:')
    console.log('   1. Chaque utilisateur reste dans sa propre session')
    console.log('   2. Les données de profil correspondent à l\'utilisateur connecté')
    console.log('   3. La déconnexion fonctionne correctement')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testUserSession()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
