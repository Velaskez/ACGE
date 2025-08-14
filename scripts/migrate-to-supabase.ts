import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔄 Création de l\'utilisateur administrateur...')
  
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acge-gabon.com' }
    })

    if (existingAdmin) {
      console.log('⚠️  L\'administrateur existe déjà')
      return existingAdmin
    }

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('Admin@2024', 10)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@acge-gabon.com',
        password: hashedPassword,
        name: 'Administrateur ACGE',
        role: 'ADMIN'
      }
    })

    console.log('✅ Administrateur créé avec succès')
    console.log('📧 Email: admin@acge-gabon.com')
    console.log('🔑 Mot de passe: Admin@2024')
    
    return admin
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
    throw error
  }
}

async function createSampleData() {
  console.log('\n🔄 Création des données d\'exemple...')
  
  try {
    // Récupérer l'admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@acge-gabon.com' }
    })

    if (!admin) {
      throw new Error('Admin non trouvé')
    }

    // Créer des dossiers d'exemple
    const folders = await Promise.all([
      prisma.folder.create({
        data: {
          name: 'Documents Administratifs',
          description: 'Documents officiels de l\'ACGE',
          authorId: admin.id
        }
      }),
      prisma.folder.create({
        data: {
          name: 'Rapports Financiers',
          description: 'Rapports et bilans financiers',
          authorId: admin.id
        }
      }),
      prisma.folder.create({
        data: {
          name: 'Ressources Humaines',
          description: 'Documents RH et personnel',
          authorId: admin.id
        }
      })
    ])

    console.log(`✅ ${folders.length} dossiers créés`)

    // Créer des tags
    const tags = await Promise.all([
      prisma.tag.create({
        data: {
          name: 'Important',
          color: '#FF0000'
        }
      }),
      prisma.tag.create({
        data: {
          name: 'Urgent',
          color: '#FFA500'
        }
      }),
      prisma.tag.create({
        data: {
          name: 'Confidentiel',
          color: '#800080'
        }
      })
    ])

    console.log(`✅ ${tags.length} tags créés`)

    // Créer des notifications d'exemple
    const notifications = await Promise.all([
      prisma.notification.create({
        data: {
          type: 'INFO',
          title: 'Bienvenue sur ACGE',
          message: 'Votre compte administrateur a été créé avec succès. Vous pouvez maintenant gérer les documents et les utilisateurs.',
          userId: admin.id
        }
      }),
      prisma.notification.create({
        data: {
          type: 'SUCCESS',
          title: 'Migration réussie',
          message: 'La migration vers Supabase a été effectuée avec succès. Toutes les fonctionnalités sont opérationnelles.',
          userId: admin.id
        }
      })
    ])

    console.log(`✅ ${notifications.length} notifications créées`)

  } catch (error) {
    console.error('❌ Erreur lors de la création des données d\'exemple:', error)
    throw error
  }
}

async function checkTables() {
  console.log('\n🔍 Vérification des tables...')
  
  try {
    const tables = [
      { name: 'users', count: await prisma.user.count() },
      { name: 'documents', count: await prisma.document.count() },
      { name: 'folders', count: await prisma.folder.count() },
      { name: 'tags', count: await prisma.tag.count() },
      { name: 'notifications', count: await prisma.notification.count() },
      { name: 'document_versions', count: await prisma.documentVersion.count() },
      { name: 'document_shares', count: await prisma.documentShare.count() },
      { name: 'comments', count: await prisma.comment.count() }
    ]

    console.log('\n📊 État des tables:')
    tables.forEach(table => {
      console.log(`   ${table.name}: ${table.count} enregistrement(s)`)
    })

    return tables
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables:', error)
    throw error
  }
}

async function disableRLS() {
  console.log('\n🔓 Désactivation de RLS pour les tables Prisma...')
  
  const tables = [
    'users',
    'documents',
    'document_versions',
    'folders',
    'tags',
    'document_shares',
    'comments',
    'notifications'
  ]

  try {
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`)
      console.log(`   ✅ RLS désactivé pour: ${table}`)
    }
  } catch (error) {
    console.error('⚠️  Erreur lors de la désactivation de RLS (peut être ignorée si les tables n\'existent pas encore):', error)
  }
}

async function main() {
  console.log('🚀 MIGRATION VERS SUPABASE - ACGE')
  console.log('==================================\n')

  try {
    // Vérifier la connexion
    console.log('🔌 Test de connexion à Supabase...')
    await prisma.$connect()
    console.log('✅ Connexion établie avec succès\n')

    // Désactiver RLS si nécessaire
    await disableRLS()

    // Créer l'admin
    await createAdmin()

    // Créer les données d'exemple
    await createSampleData()

    // Vérifier l'état final
    await checkTables()

    console.log('\n✨ Migration terminée avec succès!')
    console.log('\n📝 Prochaines étapes:')
    console.log('1. Vérifier les données dans Prisma Studio: npx prisma studio')
    console.log('2. Tester la connexion en local: npm run dev')
    console.log('3. Configurer les variables sur Vercel')
    console.log('4. Déployer sur Vercel: git push')

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
main()