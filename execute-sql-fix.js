// Script pour exécuter le SQL via l'endpoint /api/execute-sql
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const executeSQLFix = async () => {
  try {
    console.log('🚀 === EXÉCUTION SQL VIA ENDPOINT API ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    console.log('✅ Connexion à Supabase établie');
    
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
    
    // Utiliser l'endpoint /api/execute-sql
    console.log('\n🔧 Exécution du SQL via l\'endpoint API...');
    
    const response = await fetch(`${supabaseUrl.replace('supabase.co', 'vercel.app')}/api/execute-sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        sql: sqlQuery
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur API:', errorText);
      
      // Essayer avec l'URL locale
      console.log('\n🔄 Tentative avec l\'URL locale...');
      
      const localResponse = await fetch('http://localhost:3000/api/execute-sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          sql: sqlQuery
        })
      });
      
      if (!localResponse.ok) {
        const localErrorText = await localResponse.text();
        console.log('❌ Erreur API locale:', localErrorText);
      } else {
        const localResult = await localResponse.json();
        console.log('✅ SQL exécuté avec succès via API locale:', localResult);
      }
    } else {
      const result = await response.json();
      console.log('✅ SQL exécuté avec succès:', result);
    }
    
    // Test de vérification
    console.log('\n🧪 Test de vérification...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `API-TEST-${Date.now()}`,
      numeroNature: 'API-TEST-NATURE',
      objetOperation: 'Test via API endpoint',
      beneficiaire: 'Test API Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-api',
      folderName: 'Test Folder API',
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
executeSQLFix();
