// Script utilisant l'API Management de Supabase pour corriger le problème folderId
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
    
    // Utiliser l'API Management de Supabase
    const managementUrl = `https://api.supabase.com/v1/projects/${projectId}`;
    
    // Étape 1: Vérifier le statut du projet
    console.log('\n📋 1. Vérification du statut du projet...');
    
    const statusResponse = await fetch(`${managementUrl}`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statusResponse.ok) {
      const projectInfo = await statusResponse.json();
      console.log('✅ Projet actif:', projectInfo.name);
    } else {
      console.log('⚠️  Impossible de vérifier le statut du projet');
    }
    
    // Étape 2: Utiliser l'API SQL de Supabase
    console.log('\n🔧 2. Exécution du SQL via l\'API Management...');
    
    const sqlQuery = `
      -- Vérifier la structure actuelle
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
      
      -- Ajouter les colonnes si elles n'existent pas
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folderName TEXT;
      
      -- Créer un index sur folderId pour les performances
      CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
      
      -- Ajouter des commentaires
      COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
      COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
      
      -- Vérifier que les colonnes ont été ajoutées
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'dossiers' 
      AND column_name IN ('folderId', 'folderName')
      ORDER BY column_name;
    `;
    
    // Essayer l'endpoint SQL de l'API Management
    const sqlResponse = await fetch(`${managementUrl}/sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sqlQuery
      })
    });
    
    if (sqlResponse.ok) {
      const sqlResult = await sqlResponse.json();
      console.log('✅ SQL exécuté avec succès via API Management');
      console.log('📊 Résultat:', sqlResult);
    } else {
      const sqlError = await sqlResponse.text();
      console.log('❌ Erreur SQL API Management:', sqlError);
      
      // Essayer l'endpoint REST direct
      console.log('\n🔄 Tentative avec l\'endpoint REST direct...');
      
      const restResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: sqlQuery
        })
      });
      
      if (restResponse.ok) {
        const restResult = await restResponse.json();
        console.log('✅ SQL exécuté avec succès via REST');
        console.log('📊 Résultat:', restResult);
      } else {
        const restError = await restResponse.text();
        console.log('❌ Erreur REST:', restError);
      }
    }
    
    // Étape 3: Test final avec le client Supabase
    console.log('\n🧪 3. Test final...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `MGMT-TEST-${Date.now()}`,
      numeroNature: 'MGMT-TEST-NATURE',
      objetOperation: 'Test via API Management',
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
      console.log('❌ Erreur test final:', testError.message);
    } else {
      console.log('🎉 SUCCÈS: Test final réussi !');
      console.log('✅ Dossier créé:', testResult[0].numeroDossier);
      
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
