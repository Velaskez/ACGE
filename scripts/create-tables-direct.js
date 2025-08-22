const { Client } = require('pg');

async function createTablesDirect() {
  // Connexion directe à PostgreSQL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('🔧 Connexion directe à PostgreSQL...');
    await client.connect();
    console.log('✅ Connexion établie');

    // 1. Table UserSettings
    console.log('\n📋 Création de la table user_settings...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "user_settings" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
        "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
        "language" TEXT NOT NULL DEFAULT 'fr',
        "timezone" TEXT NOT NULL DEFAULT 'Africa/Libreville',
        "sessionTimeout" INTEGER NOT NULL DEFAULT 15,
        "passwordExpiry" INTEGER NOT NULL DEFAULT 90,
        "theme" TEXT NOT NULL DEFAULT 'system',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Table user_settings créée');

    // 2. Table PosteComptable
    console.log('\n📋 Création de la table postes_comptables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "postes_comptables" (
        "id" TEXT NOT NULL,
        "numero" TEXT NOT NULL,
        "intitule" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "postes_comptables_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Table postes_comptables créée');

    // 3. Table NatureDocument
    console.log('\n📋 Création de la table natures_documents...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "natures_documents" (
        "id" TEXT NOT NULL,
        "numero" TEXT NOT NULL,
        "nom" TEXT NOT NULL,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "natures_documents_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Table natures_documents créée');

    // 4. Table Dossier
    console.log('\n📋 Création de la table dossiers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "dossiers" (
        "id" TEXT NOT NULL,
        "numeroDossier" TEXT NOT NULL,
        "dateDepot" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "numeroNature" TEXT NOT NULL,
        "objetOperation" TEXT NOT NULL,
        "beneficiaire" TEXT NOT NULL,
        "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "posteComptableId" TEXT NOT NULL,
        "natureDocumentId" TEXT NOT NULL,
        "secretaireId" TEXT NOT NULL,
        CONSTRAINT "dossiers_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Table dossiers créée');

    // 5. Table ValidationDossier
    console.log('\n📋 Création de la table validations_dossiers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "validations_dossiers" (
        "id" TEXT NOT NULL,
        "statut" TEXT NOT NULL,
        "commentaire" TEXT,
        "dateValidation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "dossierId" TEXT NOT NULL,
        "validateurId" TEXT NOT NULL,
        CONSTRAINT "validations_dossiers_pkey" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Table validations_dossiers créée');

    // Ajout des contraintes uniques
    console.log('\n🔗 Ajout des contraintes uniques...');
    
    try {
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "user_settings_userId_key" ON "user_settings"("userId")');
      console.log('✅ Index user_settings_userId_key créé');
    } catch (e) {
      console.log('⚠️  Index user_settings_userId_key déjà existant');
    }

    try {
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "postes_comptables_numero_key" ON "postes_comptables"("numero")');
      console.log('✅ Index postes_comptables_numero_key créé');
    } catch (e) {
      console.log('⚠️  Index postes_comptables_numero_key déjà existant');
    }

    try {
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "natures_documents_numero_key" ON "natures_documents"("numero")');
      console.log('✅ Index natures_documents_numero_key créé');
    } catch (e) {
      console.log('⚠️  Index natures_documents_numero_key déjà existant');
    }

    try {
      await client.query('CREATE UNIQUE INDEX IF NOT EXISTS "dossiers_numeroDossier_key" ON "dossiers"("numeroDossier")');
      console.log('✅ Index dossiers_numeroDossier_key créé');
    } catch (e) {
      console.log('⚠️  Index dossiers_numeroDossier_key déjà existant');
    }

    // Ajout des clés étrangères
    console.log('\n🔗 Ajout des clés étrangères...');
    
    try {
      await client.query('ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE');
      console.log('✅ FK user_settings_userId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK user_settings_userId_fkey déjà existante');
    }

    try {
      await client.query('ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_posteComptableId_fkey" FOREIGN KEY ("posteComptableId") REFERENCES "postes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE');
      console.log('✅ FK dossiers_posteComptableId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK dossiers_posteComptableId_fkey déjà existante');
    }

    try {
      await client.query('ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_natureDocumentId_fkey" FOREIGN KEY ("natureDocumentId") REFERENCES "natures_documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE');
      console.log('✅ FK dossiers_natureDocumentId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK dossiers_natureDocumentId_fkey déjà existante');
    }

    try {
      await client.query('ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_secretaireId_fkey" FOREIGN KEY ("secretaireId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE');
      console.log('✅ FK dossiers_secretaireId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK dossiers_secretaireId_fkey déjà existante');
    }

    try {
      await client.query('ALTER TABLE "validations_dossiers" ADD CONSTRAINT "validations_dossiers_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "dossiers"("id") ON DELETE CASCADE ON UPDATE CASCADE');
      console.log('✅ FK validations_dossiers_dossierId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK validations_dossiers_dossierId_fkey déjà existante');
    }

    try {
      await client.query('ALTER TABLE "validations_dossiers" ADD CONSTRAINT "validations_dossiers_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE');
      console.log('✅ FK validations_dossiers_validateurId_fkey créée');
    } catch (e) {
      console.log('⚠️  FK validations_dossiers_validateurId_fkey déjà existante');
    }

    console.log('\n🎉 Toutes les tables comptables ont été créées avec succès !');

    // Vérifier que les tables ont été créées
    console.log('\n🔍 Vérification des tables créées...');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_settings', 'postes_comptables', 'natures_documents', 'dossiers', 'validations_dossiers')
      ORDER BY table_name
    `);
    
    console.log('✅ Tables trouvées:', result.rows.map(row => row.table_name));

  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
  } finally {
    await client.end();
  }
}

createTablesDirect();
