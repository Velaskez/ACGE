#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupAdminForVercel() {
  console.log('🔧 Configuration Admin pour Vercel...')

  try {
    // Vérifier la connexion à la base de données
    console.log('📡 Test de connexion à la base de données...')
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')

    // Vérifier la structure de la base de données
    console.log('🔍 Vérification de la structure de la base...')
    const users = await prisma.user.findMany()
    console.log(`📊 Nombre d'utilisateurs trouvés: ${users.length}`)

    // Chercher l'admin existant
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@acge.ga' },
          { role: 'ADMIN' }
        ]
      }
    })

    if (existingAdmin) {
      console.log('✅ Administrateur trouvé:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        role: existingAdmin.role,
        createdAt: existingAdmin.createdAt
      })

      // Vérifier le mot de passe
      console.log('🔐 Vérification du mot de passe...')
      const isPasswordValid = await bcrypt.compare('admin123', existingAdmin.password)
      
      if (isPasswordValid) {
        console.log('✅ Mot de passe correct')
      } else {
        console.log('❌ Mot de passe incorrect - Mise à jour...')
        const hashedPassword = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { password: hashedPassword }
        })
        console.log('✅ Mot de passe mis à jour')
      }
    } else {
      console.log('❌ Aucun administrateur trouvé - Création...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const admin = await prisma.user.create({
        data: {
          name: 'Administrateur ACGE',
          email: 'admin@acge.ga',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })

      console.log('✅ Administrateur créé:', {
        id: admin.id,
        email: admin.email,
        role: admin.role
      })
    }

    // Test de connexion final
    console.log('🧪 Test de connexion final...')
    const testAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge.ga' }
    })

    if (testAdmin) {
      const isLoginValid = await bcrypt.compare('admin123', testAdmin.password)
      console.log('🔐 Test de connexion:', isLoginValid ? '✅ SUCCÈS' : '❌ ÉCHEC')
    }

    console.log('\n🎉 Configuration terminée!')
    console.log('📋 Identifiants de connexion:')
    console.log('  Email: admin@acge.ga')
    console.log('  Mot de passe: admin123')

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Erreur de connexion - Vérifiez:')
      console.log('  1. La variable DATABASE_URL sur Vercel')
      console.log('  2. Que la base de données PostgreSQL est créée')
      console.log('  3. Que les migrations sont appliquées')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminForVercel().catch(console.error)
