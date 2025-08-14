-- Script de configuration pour la base de données MySQL LWS
-- À exécuter dans phpMyAdmin de votre panneau LWS

-- Désactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191),
  email VARCHAR(191) UNIQUE NOT NULL,
  password VARCHAR(191) NOT NULL,
  role VARCHAR(191) DEFAULT 'USER',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Table folders
CREATE TABLE IF NOT EXISTS folders (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  description TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  authorId VARCHAR(191) NOT NULL,
  parentId VARCHAR(191),
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES folders(id) ON DELETE CASCADE
);

-- Table documents
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT,
  isPublic BOOLEAN DEFAULT false,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  currentVersionId VARCHAR(191) UNIQUE,
  authorId VARCHAR(191) NOT NULL,
  folderId VARCHAR(191),
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL
);

-- Table document_versions
CREATE TABLE IF NOT EXISTS document_versions (
  id VARCHAR(191) PRIMARY KEY,
  versionNumber INT DEFAULT 1,
  fileName VARCHAR(191) NOT NULL,
  fileSize INT NOT NULL,
  fileType VARCHAR(191) NOT NULL,
  filePath VARCHAR(191) NOT NULL,
  changeLog TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  documentId VARCHAR(191) NOT NULL,
  createdById VARCHAR(191) NOT NULL,
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (createdById) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(documentId, versionNumber)
);

-- Table tags
CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) UNIQUE NOT NULL,
  color VARCHAR(191),
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- Table _DocumentToTag (relation many-to-many)
CREATE TABLE IF NOT EXISTS _DocumentToTag (
  A VARCHAR(191) NOT NULL,
  B VARCHAR(191) NOT NULL,
  FOREIGN KEY (A) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (B) REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(A, B)
);

-- Table document_shares
CREATE TABLE IF NOT EXISTS document_shares (
  id VARCHAR(191) PRIMARY KEY,
  permission VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  documentId VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table comments
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(191) PRIMARY KEY,
  content TEXT NOT NULL,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  documentId VARCHAR(191) NOT NULL,
  authorId VARCHAR(191) NOT NULL,
  FOREIGN KEY (documentId) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(191) NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  userId VARCHAR(191) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- Créer l'administrateur par défaut
-- Mot de passe: admin123 (hashé avec bcrypt)
INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) 
VALUES (
  'admin-acge-001',
  'Administrateur ACGE',
  'admin@acge.local',
  '$2a$12$6BPXs4meZf787D.W5529O.XFhkw41AmYJzPNqN0DFdHpnx9JQuUZ.',
  'ADMIN',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Afficher les tables créées
SHOW TABLES;
