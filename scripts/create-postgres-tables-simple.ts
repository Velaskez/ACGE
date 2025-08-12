// Création simple des tables PostgreSQL

import { execSync } from 'child_process'

async function createPostgresTables() {
  console.log('🐘 Création des tables PostgreSQL...\n')
  
  try {
    // Créer les tables une par une
    console.log('1. 👥 Création table users...')
    const createUsers = `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'USER',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${createUsers}"`, { stdio: 'inherit' })
    console.log('   ✅ Table users créée')
    
    console.log('\n2. 📁 Création table folders...')
    const createFolders = `CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      "authorId" TEXT NOT NULL,
      "parentId" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${createFolders}"`, { stdio: 'inherit' })
    console.log('   ✅ Table folders créée')
    
    console.log('\n3. 📄 Création table documents...')
    const createDocuments = `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      "isPublic" BOOLEAN DEFAULT FALSE,
      "authorId" TEXT NOT NULL,
      "folderId" TEXT,
      "currentVersionId" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${createDocuments}"`, { stdio: 'inherit' })
    console.log('   ✅ Table documents créée')
    
    console.log('\n4. 📋 Création table document_versions...')
    const createVersions = `CREATE TABLE IF NOT EXISTS document_versions (
      id TEXT PRIMARY KEY,
      "versionNumber" INTEGER DEFAULT 1,
      "fileName" TEXT NOT NULL,
      "fileSize" INTEGER NOT NULL,
      "fileType" TEXT NOT NULL,
      "filePath" TEXT NOT NULL,
      "changeLog" TEXT,
      "documentId" TEXT NOT NULL,
      "createdById" TEXT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${createVersions}"`, { stdio: 'inherit' })
    console.log('   ✅ Table document_versions créée')
    
    // Insérer un utilisateur admin
    console.log('\n5. 👤 Création utilisateur admin...')
    const insertAdmin = `INSERT INTO users (id, email, password, name, role) 
      VALUES ('admin-pg-001', 'admin@test.com', 'admin123', 'Admin PostgreSQL', 'ADMIN') 
      ON CONFLICT (email) DO NOTHING;`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${insertAdmin}"`, { stdio: 'inherit' })
    console.log('   ✅ Utilisateur admin créé')
    
    // Insérer des données de test
    console.log('\n6. 📊 Création données de test...')
    const insertFolder = `INSERT INTO folders (id, name, description, "authorId") 
      VALUES ('folder-pg-001', 'PostgreSQL Folder', 'Dossier de test PostgreSQL', 'admin-pg-001')
      ON CONFLICT (id) DO NOTHING;`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${insertFolder}"`, { stdio: 'inherit' })
    
    const insertDoc = `INSERT INTO documents (id, title, description, "authorId", "folderId") 
      VALUES ('doc-pg-001', 'PostgreSQL Document', 'Document de test PostgreSQL', 'admin-pg-001', 'folder-pg-001')
      ON CONFLICT (id) DO NOTHING;`
    
    execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${insertDoc}"`, { stdio: 'inherit' })
    console.log('   ✅ Données de test créées')
    
    // Vérification
    console.log('\n7. 🔍 Vérification des tables...')
    const listTables = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"', { encoding: 'utf8' })
    console.log(listTables)
    
    const countData = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT \'users\' as table_name, COUNT(*) FROM users UNION SELECT \'documents\', COUNT(*) FROM documents UNION SELECT \'folders\', COUNT(*) FROM folders;"', { encoding: 'utf8' })
    console.log('📊 Données dans les tables:')
    console.log(countData)
    
    console.log('\n🎉 PostgreSQL configuré avec succès!')
    console.log('\n🌐 ACCÈS À VOS DONNÉES:\n')
    
    console.log('🔵 pgAdmin: http://localhost:8080')
    console.log('   👤 admin@acge.local / admin123')
    console.log('   🔗 Puis connecter: acge-postgres:5432, acge_database, acge_user, acge_password_dev')
    
    console.log('\n🔵 Ligne de commande:')
    console.log('   docker exec -it acge-postgres psql -U acge_user -d acge_database')
    
    console.log('\n🔵 Clients externes:')
    console.log('   Host: localhost:5432, DB: acge_database, User: acge_user, Pass: acge_password_dev')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

createPostgresTables().catch(console.error)
