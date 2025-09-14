// Script utilisant l'API Management de Supabase pour exécuter du SQL
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const fixWithManagementAPI = async () => {
  try {
    console.log('🔧 === CORRECTION VIA API MANAGEMENT SUPABASE ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    // Extraire l'ID du projet depuis l'URL
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectId) {
      console.error('❌ Impossible d\'extraire l\'ID du projet depuis l\'URL');
      return;
    }
    
    console.log('✅ Projet Supabase:', projectId);
    
    // SQL à exécuter
    const sqlQuery = `
      -- Vérifier la structure actuelle
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
      
      -- Ajouter les colonnes folderId et folderName à la table dossiers
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folderName TEXT;
      
      -- Créer un index sur folderId pour les performances
      CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
      
      -- Commentaire sur les nouvelles colonnes
      COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
      COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
      
      -- Vérifier que les colonnes ont été ajoutées
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
    `;
    
    // Utiliser l'API Management de Supabase
    const managementUrl = `https://api.supabase.com/v1/projects/${projectId}/database/query`;
    
    console.log('\n🔧 Exécution du SQL via l\'API Management...');
    
    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sqlQuery,
        read_only: false
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SQL exécuté avec succès via API Management');
      console.log('📊 Résultat:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur API Management:', errorText);
      
      // Essayer avec l'endpoint de migration
      console.log('\n🔄 Tentative avec l\'endpoint de migration...');
      
      const migrationUrl = `https://api.supabase.com/v1/projects/${projectId}/database/migrations`;
      
      const migrationResponse = await fetch(migrationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `add_folder_columns_${Date.now()}`,
          query: sqlQuery
        })
      });
      
      if (migrationResponse.ok) {
        console.log('✅ Migration créée avec succès');
      } else {
        const migrationError = await migrationResponse.text();
        console.log('❌ Erreur migration:', migrationError);
      }
    }
    
    // Test de vérification
    console.log('\n🧪 Test de vérification...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `MGMT-TEST-${Date.now()}`,
      numeroNature: 'MGMT-TEST-NATURE',
      objetOperation: 'Test via Management API',
      beneficiaire: 'Test Management Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-management',
      folderName: 'Test Folder Management',
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data: testResult, error: testError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select();
    
    if (testError) {
      console.log('❌ Erreur test:', testError.message);
    } else {
      console.log('🎉 SUCCÈS: Test réussi !');
      console.log('✅ Dossier créé:', testResult[0].numeroDossier);
      console.log('📁 FolderId:', testResult[0].folderId);
      console.log('📁 FolderName:', testResult[0].folderName);
      
      // Nettoyer le test
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', testResult[0].id);
      
      console.log('🧹 Test nettoyé');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
fixWithManagementAPI();
