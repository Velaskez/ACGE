#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function checkAdminPassword() {
  console.log('🔍 Vérification du mot de passe admin')
  console.log('=====================================')
  
  try {
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // Récupérer l'utilisateur admin
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
    
    console.log(`👤 Utilisateur: ${adminUser.name}`)
    console.log(`📧 Email: ${adminUser.email}`)
    console.log(`🔐 Hash du mot de passe: ${adminUser.password}`)
    
    // Tester différents mots de passe courants
    const commonPasswords = [
      'admin123',
      'admin',
      'password',
      '123456',
      'admin@acge.ga',
      'acge123',
      'admin2025',
      'password123'
    ]
    
    console.log('\n🔑 Test des mots de passe courants:')
    
    for (const password of commonPasswords) {
      const isValid = await bcrypt.compare(password, adminUser.password)
      console.log(`   ${password}: ${isValid ? '✅ VALIDE' : '❌ invalide'}`)
      
      if (isValid) {
        console.log(`\n🎯 MOT DE PASSE TROUVÉ: "${password}"`)
        break
      }
    }
    
    // Si aucun mot de passe courant ne fonctionne, proposer de le réinitialiser
    console.log('\n💡 Si aucun mot de passe ne fonctionne:')
    console.log('   1. Utilisez le script de réinitialisation')
    console.log('   2. Ou connectez-vous avec un autre compte admin')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminPassword()
  .then(() => {
    console.log('\n✅ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
