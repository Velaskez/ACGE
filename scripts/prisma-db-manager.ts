import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function prismaDBManager() {
  console.log('🗄️ Gestionnaire de Base de Données Prisma\n')
  
  try {
    // 1. Vérifier la connexion
    console.log('1. 🔗 Test de connexion à la base de données...')
    await prisma.$connect()
    console.log('   ✅ Connexion PostgreSQL réussie!')
    
    // 2. Statistiques de la base
    console.log('\n2. 📊 Statistiques de la base de données...')
    const [users, documents, folders, versions, shares, comments, notifications, tags] = await Promise.all([
      prisma.user.count(),
      prisma.document.count(),
      prisma.folder.count(),
      prisma.documentVersion.count(),
      prisma.documentShare.count(),
      prisma.comment.count(),
      prisma.notification.count(),
      prisma.tag.count()
    ])
    
    console.log(`   👥 Utilisateurs: ${users}`)
    console.log(`   📄 Documents: ${documents}`)
    console.log(`   📁 Dossiers: ${folders}`)
    console.log(`   📋 Versions: ${versions}`)
    console.log(`   🔗 Partages: ${shares}`)
    console.log(`   💬 Commentaires: ${comments}`)
    console.log(`   🔔 Notifications: ${notifications}`)
    console.log(`   🏷️ Tags: ${tags}`)
    
    // 3. Vérifier l'utilisateur admin
    console.log('\n3. 👤 Vérification de l\'utilisateur admin...')
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@acge.ga' }
    })
    
    if (admin) {
      console.log('   ✅ Admin trouvé:', admin.email)
      console.log('   📋 ID:', admin.id)
      console.log('   👤 Nom:', admin.name)
      console.log('   🔑 Rôle:', admin.role)
    } else {
      console.log('   ❌ Admin non trouvé!')
    }
    
    // 4. Commandes Prisma CLI disponibles
    console.log('\n4. 🛠️ Commandes Prisma CLI disponibles:')
    console.log('   npx prisma db pull          # Synchroniser le schéma depuis la DB')
    console.log('   npx prisma db push          # Pousser le schéma vers la DB')
    console.log('   npx prisma generate         # Générer le client Prisma')
    console.log('   npx prisma studio           # Interface graphique')
    console.log('   npx prisma migrate dev      # Créer une migration')
    console.log('   npx prisma migrate deploy   # Déployer les migrations')
    console.log('   npx prisma db seed          # Exécuter le seeding')
    
    // 5. État de la synchronisation
    console.log('\n5. 🔄 État de la synchronisation...')
    try {
      const result = execSync('npx prisma db push --dry-run', { encoding: 'utf8' })
      if (result.includes('already in sync')) {
        console.log('   ✅ Base de données synchronisée avec le schéma')
      } else {
        console.log('   ⚠️ Des modifications sont nécessaires')
      }
    } catch (error) {
      console.log('   ❌ Erreur lors de la vérification de synchronisation')
    }
    
    // 6. Recommandations
    console.log('\n6. 💡 Recommandations:')
    console.log('   • Utilisez "npx prisma studio" pour gérer visuellement la DB')
    console.log('   • "npx prisma db pull" pour récupérer les changements de la DB')
    console.log('   • "npx prisma db push" pour appliquer les changements du schéma')
    console.log('   • "npx prisma generate" après modification du schéma')
    
    console.log('\n🎉 Gestionnaire Prisma prêt!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la gestion de la base de données:', error)
  } finally {
    await prisma.$disconnect()
  }
}

prismaDBManager().catch(console.error)
