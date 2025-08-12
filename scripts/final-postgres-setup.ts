// Configuration finale et test complet de PostgreSQL
import { execSync } from 'child_process'
import { config } from 'dotenv'
import path from 'path'

async function finalPostgreSQLSetup() {
  console.log('🎯 Configuration finale PostgreSQL...\n')
  
  try {
    // 1. Charger les variables d'environnement
    const envPath = path.join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    console.log('1. ⚙️ Variables d\'environnement chargées')
    console.log(`   📋 DATABASE_URL: ${process.env.DATABASE_URL}`)
    
    // 2. Vérifier que PostgreSQL est prêt
    console.log('\n2. 🐘 Vérification PostgreSQL...')
    let retries = 0
    const maxRetries = 6
    
    while (retries < maxRetries) {
      try {
        const result = execSync('docker exec acge-postgres pg_isready -U acge_user -d acge_database', { encoding: 'utf8' })
        if (result.includes('accepting connections')) {
          console.log('   ✅ PostgreSQL prêt!')
          break
        }
      } catch {
        retries++
        console.log(`   ⏳ Attente PostgreSQL (${retries}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    if (retries >= maxRetries) {
      throw new Error('PostgreSQL n\'est pas disponible après plusieurs tentatives')
    }
    
    // 3. Créer les tables avec Prisma
    console.log('\n3. 📊 Création des tables avec Prisma...')
    try {
      // Définir explicitement l'environnement pour Prisma
      const prismaEnv = {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
        NODE_ENV: 'development'
      }
      
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: prismaEnv
      })
      console.log('   ✅ Tables créées avec succès!')
      
    } catch (error) {
      console.log('   ❌ Erreur lors de la création des tables')
      throw error
    }
    
    // 4. Test avec le nouveau client Prisma
    console.log('\n4. 🧪 Test du client Prisma...')
    
    // Importer après la création des tables
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    try {
      await prisma.$connect()
      console.log('   ✅ Connexion Prisma réussie!')
      
      // 5. Créer l'utilisateur admin
      console.log('\n5. 👤 Création de l\'utilisateur admin...')
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const adminUser = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {
          password: hashedPassword,
          role: 'ADMIN'
        },
        create: {
          email: 'admin@test.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN'
        }
      })
      
      console.log('   ✅ Utilisateur admin créé:', adminUser.email)
      
      // 6. Créer des données de test
      console.log('\n6. 📁 Création de données de test...')
      
      const testFolder = await prisma.folder.upsert({
        where: { id: 'postgres-test-folder' },
        update: { name: 'PostgreSQL Test Folder' },
        create: {
          id: 'postgres-test-folder',
          name: 'PostgreSQL Test Folder',
          description: 'Dossier de test pour PostgreSQL',
          authorId: adminUser.id
        }
      })
      
      const testDocument = await prisma.document.upsert({
        where: { id: 'postgres-test-doc' },
        update: { title: 'PostgreSQL Test Document' },
        create: {
          id: 'postgres-test-doc',
          title: 'PostgreSQL Test Document',
          description: 'Document de test pour PostgreSQL',
          authorId: adminUser.id,
          folderId: testFolder.id
        }
      })
      
      const version = await prisma.documentVersion.upsert({
        where: { id: 'postgres-test-version' },
        update: { fileName: 'postgres-test.txt' },
        create: {
          id: 'postgres-test-version',
          versionNumber: 1,
          fileName: 'postgres-test.txt',
          fileSize: 1024,
          fileType: 'text/plain',
          filePath: '/postgres/test.txt',
          changeLog: 'Version PostgreSQL',
          documentId: testDocument.id,
          createdById: adminUser.id
        }
      })
      
      await prisma.document.update({
        where: { id: testDocument.id },
        data: { currentVersionId: version.id }
      })
      
      console.log('   ✅ Données de test créées')
      
      // 7. Statistiques finales
      console.log('\n7. 📊 Statistiques PostgreSQL:')
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
      
      await prisma.$disconnect()
      
      console.log('\n🎉 PostgreSQL complètement configuré et opérationnel!')
      console.log('\n📊 Informations de connexion PostgreSQL:')
      console.log('   🗄️ Database: acge_database')
      console.log('   👤 User: acge_user')
      console.log('   🔑 Password: acge_password_dev')
      console.log('   🌐 Host: localhost:5432')
      console.log('   📱 pgAdmin: http://localhost:8080 (admin@acge.local / admin123)')
      
      console.log('\n🔑 Login Application:')
      console.log('   📧 Email: admin@test.com')
      console.log('   🔑 Password: admin123')
      
      console.log('\n✅ Migration SQLite → PostgreSQL TERMINÉE!')
      console.log('\n▶️ Prochaines étapes:')
      console.log('   1. Redémarrer l\'application: npm run dev')
      console.log('   2. Tester les APIs avec PostgreSQL')
      console.log('   3. Utiliser pgAdmin pour explorer la base')
      
      return true
      
    } catch (prismaError) {
      console.log('   ❌ Erreur Prisma:', prismaError)
      await prisma.$disconnect()
      throw prismaError
    }
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la configuration finale:', error)
    
    console.log('\n🔄 État actuel:')
    console.log('   ✅ SQLite fonctionne parfaitement')
    console.log('   ⚠️ PostgreSQL nécessite des ajustements')
    
    console.log('\n💡 Alternatives:')
    console.log('   1. Continuer avec SQLite (déjà opérationnel)')
    console.log('   2. Utiliser PostgreSQL cloud (Supabase, Neon)')
    console.log('   3. Installer PostgreSQL localement')
    
    return false
  }
}

finalPostgreSQLSetup().catch(console.error)
