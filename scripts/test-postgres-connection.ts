// Test de connexion PostgreSQL
import { PrismaClient } from '@prisma/client'

async function testPostgreSQLConnection() {
  console.log('🐘 Test de connexion PostgreSQL...\n')
  
  const prisma = new PrismaClient()
  
  try {
    // 1. Test de connexion de base
    console.log('1. 🔗 Test de connexion...')
    await prisma.$connect()
    console.log('   ✅ Connexion PostgreSQL réussie!')
    
    // 2. Test des tables
    console.log('\n2. 📊 Vérification des tables...')
    const userCount = await prisma.user.count()
    const documentCount = await prisma.document.count()
    const folderCount = await prisma.folder.count()
    
    console.log(`   📋 Tables créées:`)
    console.log(`      - Users: ${userCount} enregistrements`)
    console.log(`      - Documents: ${documentCount} enregistrements`)
    console.log(`      - Folders: ${folderCount} enregistrements`)
    
    // 3. Créer un utilisateur admin si nécessaire
    console.log('\n3. 👤 Vérification utilisateur admin...')
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@test.com' }
    })
    
    if (!adminUser) {
      console.log('   🔧 Création de l\'utilisateur admin...')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      console.log('   ✅ Utilisateur admin créé!')
    } else {
      console.log('   ✅ Utilisateur admin existe déjà')
    }
    
    // 4. Créer un dossier et document test si nécessaire
    console.log('\n4. 📁 Création de données de test...')
    let testFolder = await prisma.folder.findFirst({
      where: { name: 'Test Folder' }
    })
    
    if (!testFolder) {
      testFolder = await prisma.folder.create({
        data: {
          name: 'Test Folder',
          description: 'Dossier de test pour PostgreSQL',
          authorId: adminUser.id
        }
      })
      console.log('   ✅ Dossier de test créé')
    }
    
    let testDocument = await prisma.document.findFirst({
      where: { title: 'Test Document PostgreSQL' }
    })
    
    if (!testDocument) {
      // Créer d'abord le document
      testDocument = await prisma.document.create({
        data: {
          title: 'Test Document PostgreSQL',
          description: 'Document de test pour PostgreSQL',
          authorId: adminUser.id,
          folderId: testFolder.id
        }
      })
      
      // Puis créer une version
      const version = await prisma.documentVersion.create({
        data: {
          versionNumber: 1,
          fileName: 'test-postgres.txt',
          fileSize: 1024,
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
      
      console.log('   ✅ Document de test créé')
    }
    
    // 5. Statistiques finales
    console.log('\n📊 Statistiques PostgreSQL:')
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
    
    console.log('\n🎉 PostgreSQL configuré et opérationnel!')
    console.log('\n🔑 Informations de connexion:')
    console.log('   Email: admin@test.com')
    console.log('   Password: admin123')
    console.log('\n📊 Base de données PostgreSQL:')
    console.log('   Host: localhost:5432')
    console.log('   Database: acge_database')
    console.log('   User: acge_user')
    
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error)
    
    console.log('\n🔄 Vérifications à effectuer:')
    console.log('   1. Docker Desktop est-il démarré?')
    console.log('   2. Le container PostgreSQL est-il en cours d\'exécution?')
    console.log('   3. Le fichier .env.local contient-il la bonne URL?')
    
    console.log('\n💡 Commandes utiles:')
    console.log('   docker-compose ps')
    console.log('   docker-compose logs postgres')
    console.log('   docker-compose restart postgres')
  } finally {
    await prisma.$disconnect()
  }
}

testPostgreSQLConnection().catch(console.error)
