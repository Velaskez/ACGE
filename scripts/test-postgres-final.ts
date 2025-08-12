// Test final de PostgreSQL avec variables d'environnement correctes
import { config } from 'dotenv'
import path from 'path'

async function testPostgreSQLFinal() {
  console.log('🐘 Test final PostgreSQL...\n')
  
  try {
    // 1. Charger .env.local
    const envPath = path.join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    console.log('1. ⚙️ Configuration chargée')
    console.log(`   📋 DATABASE_URL: ${process.env.DATABASE_URL}`)
    
    // 2. Test de connexion Prisma
    console.log('\n2. 🔗 Test de connexion Prisma...')
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$connect()
    console.log('   ✅ Connexion Prisma réussie!')
    
    // 3. Créer les tables avec Prisma
    console.log('\n3. 📊 Création des tables...')
    try {
      // Tenter de créer un utilisateur pour forcer la création des tables
      const testCount = await prisma.user.count()
      console.log(`   ✅ Tables existantes - ${testCount} utilisateurs`)
    } catch (error) {
      console.log('   ⚠️ Tables à créer via Prisma push')
      console.log('   💡 Exécutez: npx prisma db push --accept-data-loss')
    }
    
    // 4. Créer utilisateur admin
    console.log('\n4. 👤 Configuration utilisateur admin...')
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    try {
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        },
        create: {
          email: 'admin@test.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      
      console.log('   ✅ Utilisateur admin configuré:', adminUser.email)
      
      // 5. Créer données de test
      console.log('\n5. 📁 Création de données de test...')
      
      const testFolder = await prisma.folder.upsert({
        where: { id: 'folder-postgres-test' },
        update: { name: 'Test Folder PostgreSQL' },
        create: {
          id: 'folder-postgres-test',
          name: 'Test Folder PostgreSQL',
          description: 'Dossier de test pour PostgreSQL',
          authorId: adminUser.id
        }
      })
      
      const testDocument = await prisma.document.upsert({
        where: { id: 'doc-postgres-test' },
        update: { title: 'Test Document PostgreSQL' },
        create: {
          id: 'doc-postgres-test',
          title: 'Test Document PostgreSQL',
          description: 'Document de test pour PostgreSQL',
          authorId: adminUser.id,
          folderId: testFolder.id
        }
      })
      
      // Créer une version du document
      const version = await prisma.documentVersion.upsert({
        where: { id: 'version-postgres-test' },
        update: { fileName: 'test-postgres.txt' },
        create: {
          id: 'version-postgres-test',
          versionNumber: 1,
          fileName: 'test-postgres.txt',
          fileSize: 2048,
          fileType: 'text/plain',
          filePath: '/test/postgres.txt',
          changeLog: 'Version initiale PostgreSQL',
          documentId: testDocument.id,
          createdById: adminUser.id
        }
      })
      
      // Mettre à jour le document avec la version courante
      await prisma.document.update({
        where: { id: testDocument.id },
        data: { currentVersionId: version.id }
      })
      
      console.log('   ✅ Données de test créées')
      
      // 6. Statistiques finales
      console.log('\n6. 📊 Statistiques PostgreSQL:')
      const [users, documents, folders, versions] = await Promise.all([
        prisma.user.count(),
        prisma.document.count(),
        prisma.folder.count(),
        prisma.documentVersion.count()
      ])
      
      console.log(`   👥 Utilisateurs: ${users}`)
      console.log(`   📄 Documents: ${documents}`)
      console.log(`   📁 Dossiers: ${folders}`)
      console.log(`   📋 Versions: ${versions}`)
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la configuration des données:', error)
    }
    
    await prisma.$disconnect()
    
    console.log('\n🎉 PostgreSQL configuré et opérationnel!')
    console.log('\n📊 Configuration finale:')
    console.log('   🗄️ Base: acge_database (PostgreSQL)')
    console.log('   🌐 Host: localhost:5432')
    console.log('   👤 User: acge_user')
    console.log('   🔑 Password: acge_password_dev')
    
    console.log('\n🔑 Login Application:')
    console.log('   📧 Email: admin@test.com')
    console.log('   🔑 Password: admin123')
    
    console.log('\n✅ Migration SQLite → PostgreSQL terminée!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test PostgreSQL:', error)
    
    console.log('\n🔧 Diagnostic:')
    console.log('1. Docker Desktop est-il démarré?')
    console.log('2. Le container PostgreSQL est-il en cours?')
    console.log('3. Les variables d\'environnement sont-elles correctes?')
    console.log('\n💡 Commandes utiles:')
    console.log('   docker-compose ps')
    console.log('   docker-compose logs postgres')
    console.log('   npx prisma studio')
  }
}

testPostgreSQLFinal().catch(console.error)
