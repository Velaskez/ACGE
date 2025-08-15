#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function resetAdminPassword() {
  console.log('🔧 Réinitialisation du mot de passe admin')
  console.log('=========================================')
  
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
        role: true
      }
    })
    
    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé')
      return
    }
    
    console.log(`👤 Utilisateur: ${adminUser.name}`)
    console.log(`📧 Email: ${adminUser.email}`)
    console.log(`🔐 Rôle: ${adminUser.role}`)
    
    // Nouveau mot de passe
    const newPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    console.log(`\n🔄 Réinitialisation du mot de passe...`)
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`)
    console.log(`🔐 Hash généré: ${hashedPassword.substring(0, 30)}...`)
    
    // Mettre à jour le mot de passe
    const updatedUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log('✅ Mot de passe mis à jour avec succès!')
    console.log(`👤 Utilisateur mis à jour: ${updatedUser.name}`)
    
    // Vérifier que le nouveau mot de passe fonctionne
    const isPasswordValid = await bcrypt.compare(newPassword, hashedPassword)
    console.log(`🔐 Vérification du nouveau mot de passe: ${isPasswordValid ? '✅ Valide' : '❌ Invalide'}`)
    
    console.log('\n🎯 Informations de connexion:')
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Mot de passe: ${newPassword}`)
    console.log(`   Rôle: ${updatedUser.role}`)
    
    console.log('\n💡 Vous pouvez maintenant:')
    console.log('   1. Vous connecter avec ces identifiants')
    console.log('   2. Tester le changement de mot de passe via l\'interface')
    console.log('   3. Utiliser le script test-password-change.ts pour valider')
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()
  .then(() => {
    console.log('\n✅ Réinitialisation terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
