// Configuration complète PostgreSQL Docker avec création des tables

import { config } from 'dotenv'
import path from 'path'
import { execSync } from 'child_process'

async function setupPostgreSQLWithTables() {
  console.log('🐘 Configuration PostgreSQL Docker avec tables\n')
  
  try {
    // 1. Charger les variables d'environnement
    const envPath = path.join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    console.log('1. ⚙️ Configuration environnement...')
    console.log(`   📋 DATABASE_URL: ${process.env.DATABASE_URL}`)
    
    // 2. Créer les tables directement via SQL
    console.log('\n2. 📊 Création des tables via SQL...')
    
    const createTablesSQL = `
-- Création des tables ACGE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'SECRETAIRE',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("parentId") REFERENCES folders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "isPublic" BOOLEAN DEFAULT FALSE,
    "authorId" TEXT NOT NULL,
    "folderId" TEXT,
    "currentVersionId" TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("folderId") REFERENCES folders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    "versionNumber" INTEGER DEFAULT 1,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "changeLog" TEXT,
    "documentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY ("createdById") REFERENCES users(id),
    UNIQUE ("documentId", "versionNumber")
);

-- Ajout de la contrainte pour currentVersionId
ALTER TABLE documents 
ADD CONSTRAINT fk_current_version 
FOREIGN KEY ("currentVersionId") REFERENCES document_versions(id);

-- Autres tables...
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_shares (
    id TEXT PRIMARY KEY,
    permission TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE ("documentId", "userId")
);

CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("documentId") REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE
);
`
    
    // Écrire le script SQL dans un fichier temporaire
    const sqlFilePath = path.join(process.cwd(), 'temp_create_tables.sql')
    require('fs').writeFileSync(sqlFilePath, createTablesSQL)
    
    try {
      // Exécuter le script SQL
      execSync(`docker exec -i acge-postgres psql -U acge_user -d acge_database < ${sqlFilePath}`, { 
        stdio: 'inherit'
      })
      console.log('   ✅ Tables créées avec succès!')
    } catch (error) {
      console.log('   ❌ Erreur lors de la création des tables')
      throw error
    } finally {
      // Nettoyer le fichier temporaire
      require('fs').unlinkSync(sqlFilePath)
    }
    
    // 3. Créer un utilisateur admin
    console.log('\n3. 👤 Création utilisateur admin...')
    const adminSQL = `
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt") 
VALUES (
  'admin-postgres-001',
  'admin@test.com',
  '$2a$10$rZ/kR1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1K1',
  'Admin PostgreSQL',
  'ADMIN',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
`
    
    try {
      execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${adminSQL.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe'
      })
      console.log('   ✅ Utilisateur admin créé')
    } catch (error) {
      console.log('   ⚠️ Utilisateur admin existe peut-être déjà')
    }
    
    // 4. Créer des données de test
    console.log('\n4. 📁 Création données de test...')
    const testDataSQL = `
-- Dossier de test
INSERT INTO folders (id, name, description, "authorId", "createdAt", "updatedAt")
VALUES (
  'folder-postgres-001',
  'PostgreSQL Test Folder',
  'Dossier de test pour PostgreSQL Docker',
  'admin-postgres-001',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Document de test
INSERT INTO documents (id, title, description, "authorId", "folderId", "createdAt", "updatedAt")
VALUES (
  'doc-postgres-001',
  'PostgreSQL Test Document',
  'Document de test pour PostgreSQL Docker',
  'admin-postgres-001',
  'folder-postgres-001',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Version du document
INSERT INTO document_versions (id, "versionNumber", "fileName", "fileSize", "fileType", "filePath", "changeLog", "documentId", "createdById", "createdAt")
VALUES (
  'version-postgres-001',
  1,
  'postgres-test.txt',
  1024,
  'text/plain',
  '/postgres/test.txt',
  'Version PostgreSQL Docker',
  'doc-postgres-001',
  'admin-postgres-001',
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Lier la version courante au document
UPDATE documents 
SET "currentVersionId" = 'version-postgres-001' 
WHERE id = 'doc-postgres-001';
`
    
    try {
      execSync(`docker exec acge-postgres psql -U acge_user -d acge_database -c "${testDataSQL.replace(/"/g, '\\"')}"`, {
        stdio: 'pipe'
      })
      console.log('   ✅ Données de test créées')
    } catch (error) {
      console.log('   ⚠️ Erreur lors de la création des données de test:', error)
    }
    
    // 5. Vérification finale
    console.log('\n5. 📊 Vérification...')
    try {
      const tables = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "\\dt"', { encoding: 'utf8' })
      console.log('   ✅ Tables créées:')
      console.log(tables)
      
      const stats = execSync('docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT \'users\' as table_name, COUNT(*) as count FROM users UNION SELECT \'documents\', COUNT(*) FROM documents UNION SELECT \'folders\', COUNT(*) FROM folders ORDER BY table_name;"', { encoding: 'utf8' })
      console.log('   📈 Statistiques:')
      console.log(stats)
      
    } catch (error) {
      console.log('   ⚠️ Erreur lors de la vérification')
    }
    
    console.log('\n🎉 PostgreSQL Docker configuré avec succès!')
    console.log('\n🌐 ACCÈS À VOS DONNÉES:\n')
    
    console.log('🔵 1. pgAdmin (Interface Web)')
    console.log('   📱 URL: http://localhost:8080')
    console.log('   👤 Email: admin@acge.local | 🔑 Password: admin123')
    console.log('   🔗 Connexion à la base:')
    console.log('      Host: acge-postgres | Port: 5432')
    console.log('      Database: acge_database | User: acge_user | Password: acge_password_dev')
    
    console.log('\n🔵 2. Ligne de commande')
    console.log('   💻 Accès interactif:')
    console.log('      docker exec -it acge-postgres psql -U acge_user -d acge_database')
    
    console.log('\n🔵 3. Clients externes (DBeaver, etc.)')
    console.log('   🔗 Paramètres:')
    console.log('      Host: localhost | Port: 5432')
    console.log('      Database: acge_database | User: acge_user | Password: acge_password_dev')
    
    console.log('\n🔵 4. Prisma Studio')
    console.log('   🎨 Interface Prisma: npx prisma studio')
    console.log('   📱 URL: http://localhost:5555')
    
    console.log('\n💾 COMMANDES DE BACKUP:')
    console.log('   # Backup complet')
    console.log('   docker exec acge-postgres pg_dump -U acge_user acge_database > backup_postgres.sql')
    console.log('')
    console.log('   # Restore')
    console.log('   docker exec -i acge-postgres psql -U acge_user acge_database < backup_postgres.sql')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  }
}

setupPostgreSQLWithTables().catch(console.error)
