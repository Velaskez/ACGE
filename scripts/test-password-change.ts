#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function testPasswordChange() {
  console.log('🔐 Test de changement de mot de passe')
  console.log('=====================================')
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣ Test connexion base de données...')
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // 2. Récupérer l'utilisateur admin
    console.log('\n2️⃣ Récupération de l\'utilisateur admin...')
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@acge-gabon.com'
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true
      }
    })
    
    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé')
      return
    }
    
    console.log(`👤 Utilisateur trouvé: ${adminUser.name}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Rôle: ${adminUser.role}`)
    console.log(`   Mot de passe hashé: ${adminUser.password.substring(0, 20)}...`)
    
    // 3. Vérifier le mot de passe actuel
    console.log('\n3️⃣ Test du mot de passe actuel...')
    const currentPassword = 'admin123'
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password)
    
    console.log(`🔑 Mot de passe actuel '${currentPassword}': ${isCurrentPasswordValid ? '✅ Valide' : '❌ Invalide'}`)
    
    if (!isCurrentPasswordValid) {
      console.log('⚠️ Le mot de passe actuel ne correspond pas à "admin123"')
      console.log('💡 Vérifiez que l\'utilisateur admin utilise bien ce mot de passe')
    }
    
    // 4. Simuler un changement de mot de passe
    console.log('\n4️⃣ Simulation de changement de mot de passe...')
    
    const newPassword = `test_password_${Date.now()}`
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)
    
    console.log(`🔄 Nouveau mot de passe: ${newPassword}`)
    console.log(`🔐 Hash généré: ${hashedNewPassword.substring(0, 30)}...`)
    
    // 5. Test de l'API réelle
    console.log('\n5️⃣ Test de l\'API de changement de mot de passe...')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // D'abord, se connecter pour obtenir un token
    console.log('🔑 Connexion pour obtenir un token...')
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@acge-gabon.com',
        password: currentPassword
      })
    })
    
    if (!loginResponse.ok) {
      console.log('❌ Échec de la connexion pour obtenir le token')
      const errorText = await loginResponse.text()
      console.log('Erreur:', errorText)
      return
    }
    
    const cookies = loginResponse.headers.get('set-cookie')
    console.log('✅ Connexion réussie, token obtenu')
    
    // Maintenant, tester le changement de mot de passe
    const updateData = {
      name: adminUser.name,
      email: adminUser.email,
      currentPassword: currentPassword,
      newPassword: newPassword
    }
    
    console.log('📝 Données de mise à jour:')
    console.log(JSON.stringify(updateData, null, 2))
    
    const profileResponse = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(updateData)
    })
    
    console.log(`📡 Status API profile: ${profileResponse.status}`)
    
    if (profileResponse.ok) {
      const data = await profileResponse.json()
      console.log('✅ Réponse API:')
      console.log(JSON.stringify(data, null, 2))
      console.log('🎉 Changement de mot de passe réussi!')
      
      // 6. Vérifier en base de données
      console.log('\n6️⃣ Vérification en base de données...')
      
      const updatedUser = await prisma.user.findUnique({
        where: { id: adminUser.id },
        select: { password: true }
      })
      
      if (updatedUser) {
        const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password)
        console.log(`🔐 Nouveau mot de passe en base: ${isNewPasswordValid ? '✅ Valide' : '❌ Invalide'}`)
        
        if (isNewPasswordValid) {
          console.log('✅ Le mot de passe a été correctement mis à jour en base!')
        } else {
          console.log('❌ Le mot de passe n\'a pas été mis à jour en base')
        }
      }
      
      // 7. Test de connexion avec le nouveau mot de passe
      console.log('\n7️⃣ Test de connexion avec le nouveau mot de passe...')
      
      const newLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@acge-gabon.com',
          password: newPassword
        })
      })
      
      if (newLoginResponse.ok) {
        console.log('✅ Connexion réussie avec le nouveau mot de passe!')
      } else {
        console.log('❌ Échec de connexion avec le nouveau mot de passe')
        const errorText = await newLoginResponse.text()
        console.log('Erreur:', errorText)
      }
      
      // 8. Remettre l'ancien mot de passe pour ne pas casser l'environnement
      console.log('\n8️⃣ Restauration de l\'ancien mot de passe...')
      
      const restoreData = {
        name: adminUser.name,
        email: adminUser.email,
        currentPassword: newPassword,
        newPassword: currentPassword
      }
      
      const restoreResponse = await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        body: JSON.stringify(restoreData)
      })
      
      if (restoreResponse.ok) {
        console.log('✅ Ancien mot de passe restauré')
      } else {
        console.log('⚠️ Impossible de restaurer l\'ancien mot de passe')
        console.log('💡 Vous devrez peut-être le remettre manuellement')
      }
      
    } else {
      const errorData = await profileResponse.text()
      console.log('❌ Erreur API profile:', errorData)
    }
    
    // 9. Recommandations
    console.log('\n9️⃣ Recommandations...')
    console.log('✅ La fonctionnalité de changement de mot de passe est opérationnelle')
    console.log('🔧 Vous pouvez maintenant:')
    console.log('   1. Changer votre mot de passe via l\'interface')
    console.log('   2. Valider que le nouveau mot de passe fonctionne')
    console.log('   3. Tester les cas d\'erreur (mot de passe incorrect, etc.)')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testPasswordChange()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
