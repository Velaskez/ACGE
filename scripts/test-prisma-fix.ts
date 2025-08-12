// Test rapide : Vérification client Prisma après réparation

import { PrismaClient } from '@prisma/client'

async function testPrismaFix() {
  console.log('🔧 TEST: Client Prisma après réparation\n')
  
  let prisma: PrismaClient
  
  try {
    console.log('📡 Connexion à PostgreSQL Docker...')
    prisma = new PrismaClient()
    
    // Test de connexion basique
    await prisma.$connect()
    console.log('✅ Connexion Prisma réussie!')
    
    // Test des tables
    const userCount = await prisma.user.count()
    console.log(`👥 Utilisateurs: ${userCount}`)
    
    const folderCount = await prisma.folder.count()
    console.log(`📁 Dossiers: ${folderCount}`)
    
    const documentCount = await prisma.document.count()
    console.log(`📄 Documents: ${documentCount}`)
    
    // Afficher quelques données
    if (userCount > 0) {
      const users = await prisma.user.findMany({ take: 3 })
      console.log('\n👤 Utilisateurs dans la base:')
      users.forEach(user => {
        console.log(`  • ${user.email} (${user.role})`)
      })
    }
    
    if (folderCount > 0) {
      const folders = await prisma.folder.findMany({ take: 3 })
      console.log('\n📁 Dossiers dans la base:')
      folders.forEach(folder => {
        console.log(`  • ${folder.name}`)
      })
    }
    
    console.log('\n🎉 Client Prisma fonctionne parfaitement!')
    console.log('✅ Prisma Studio devrait maintenant marcher')
    
  } catch (error) {
    console.log('❌ Erreur Prisma:', error.message)
    console.log('\n🔍 Diagnostic:')
    
    if (error.message.includes('connect')) {
      console.log('💡 Problème de connexion - Vérifiez Docker:')
      console.log('   docker ps')
      console.log('   docker-compose up -d')
    } else if (error.message.includes('schema')) {
      console.log('💡 Problème de schéma - Regénérez:')
      console.log('   npx prisma generate')
      console.log('   npx prisma db push')
    } else {
      console.log('💡 Erreur générale - Vérifiez:')
      console.log('   • Variables d\'environnement (.env.local)')
      console.log('   • Schéma Prisma (prisma/schema.prisma)')
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

testPrismaFix().catch(console.error)
