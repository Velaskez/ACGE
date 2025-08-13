import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function setupPrismaProduction() {
  console.log('🚀 Configuration Prisma pour la production\n')
  
  try {
    // 1. Test de connexion à la base de données
    console.log('1. 🗄️ Test de connexion à la base de données...')
    await prisma.$connect()
    console.log('   ✅ Connexion PostgreSQL réussie!')
    
    // 2. Vérifier les tables
    console.log('\n2. 📊 Vérification des tables...')
    const userCount = await prisma.user.count()
    const documentCount = await prisma.document.count()
    const folderCount = await prisma.folder.count()
    
    console.log(`   👥 Utilisateurs: ${userCount}`)
    console.log(`   📄 Documents: ${documentCount}`)
    console.log(`   📁 Dossiers: ${folderCount}`)
    
    // 3. Créer l'utilisateur admin si nécessaire
    console.log('\n3. 👤 Vérification de l\'utilisateur admin...')
    let admin = await prisma.user.findFirst({
      where: { email: 'admin@acge.ga' }
    })
    
    if (!admin) {
      console.log('   🔧 Création de l\'utilisateur admin...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      admin = await prisma.user.create({
        data: {
          email: 'admin@acge.ga',
          name: 'Administrateur',
          password: hashedPassword,
          role: 'ADMIN'
        }
      })
      console.log('   ✅ Utilisateur admin créé!')
    } else {
      console.log('   ✅ Utilisateur admin existe déjà')
    }
    
    // 4. Configuration pour Vercel
    console.log('\n4. 🌐 Configuration pour Vercel...')
    console.log('   📋 Variables d\'environnement à configurer sur Vercel:')
    console.log('   DATABASE_URL="postgresql://username:password@hostname:port/database"')
    console.log('   NEXTAUTH_SECRET="your-secret-key-here"')
    console.log('   NEXTAUTH_URL="https://your-app.vercel.app"')
    console.log('   NEXT_PUBLIC_API_URL="https://your-app.vercel.app"')
    
    // 5. Instructions de déploiement
    console.log('\n5. 📋 Instructions de déploiement:')
    console.log('   1. Créer une base PostgreSQL sur votre hébergeur préféré')
    console.log('   2. Configurer les variables d\'environnement sur Vercel')
    console.log('   3. Exécuter: npx prisma db push')
    console.log('   4. Exécuter: npm run build')
    console.log('   5. Déployer sur Vercel')
    
    console.log('\n🎉 Configuration Prisma terminée!')
    console.log('\n🔑 Informations de connexion:')
    console.log('   📧 Email: admin@acge.ga')
    console.log('   🔑 Mot de passe: admin123')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupPrismaProduction().catch(console.error)
