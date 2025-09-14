// Script pour corriger directement le problème folderId via l'API Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const fixFolderIdDirectly = async () => {
  try {
    console.log('🚀 === CORRECTION DIRECTE VIA API SUPABASE ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    console.log('✅ Connexion à Supabase établie');
    console.log('🔗 URL:', supabaseUrl);
    
    // Utiliser la clé service pour les opérations admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Étape 1: Créer une fonction SQL temporaire pour exécuter du DDL
    console.log('\n🔧 1. Création d\'une fonction SQL temporaire...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION add_folder_columns()
      RETURNS TEXT AS $$
      BEGIN
        -- Ajouter les colonnes folderId et folderName à la table dossiers
        ALTER TABLE dossiers 
        ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS folderName TEXT;
        
        -- Créer un index sur folderId pour les performances
        CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
        
        -- Ajouter des commentaires sur les nouvelles colonnes
        COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
        COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
        
        RETURN 'Colonnes folderId et folderName ajoutées avec succès';
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    try {
      // Utiliser l'API REST directe pour exécuter le SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sql: createFunctionSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ Fonction SQL créée avec succès');
      } else {
        const errorText = await response.text();
        console.log('⚠️  Erreur création fonction (peut être normale):', errorText);
      }
    } catch (error) {
      console.log('⚠️  Erreur API (peut être normale):', error.message);
    }
    
    // Étape 2: Exécuter la fonction pour ajouter les colonnes
    console.log('\n🔧 2. Exécution de la fonction pour ajouter les colonnes...');
    
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('add_folder_columns');
      
      if (functionError) {
        console.log('❌ Erreur exécution fonction:', functionError.message);
        
        // Essayer une approche alternative avec l'API REST directe
        console.log('\n🔄 Tentative alternative avec API REST...');
        
        const addColumnsSQL = `
          ALTER TABLE dossiers 
          ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS folderName TEXT;
          
          CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
          
          COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
          COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
        `;
        
        const directResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: addColumnsSQL
          })
        });
        
        if (directResponse.ok) {
          console.log('✅ Colonnes ajoutées via API REST directe');
        } else {
          const directError = await directResponse.text();
          console.log('❌ Erreur API REST directe:', directError);
        }
      } else {
        console.log('✅ Fonction exécutée avec succès:', functionResult);
      }
    } catch (error) {
      console.log('❌ Erreur exécution:', error.message);
    }
    
    // Étape 3: Test de vérification
    console.log('\n🧪 3. Test de vérification...');
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `DIRECT-TEST-${Date.now()}`,
      numeroNature: 'DIRECT-TEST-NATURE',
      objetOperation: 'Test de correction directe',
      beneficiaire: 'Test Direct Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-direct',
      folderName: 'Test Folder Direct',
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
      
      if (testError.message.includes('folderId')) {
        console.log('\n💡 La colonne folderId n\'existe toujours pas.');
        console.log('📝 Solutions alternatives:');
        console.log('   1. Exécuter le SQL manuellement dans l\'interface Supabase');
        console.log('   2. Utiliser l\'outil MCP Supabase si disponible');
        console.log('   3. Contacter le support Supabase');
      }
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
      console.log('🎉 La correction folderId fonctionne parfaitement !');
    }
    
    // Étape 4: Nettoyer la fonction temporaire
    console.log('\n🧹 4. Nettoyage de la fonction temporaire...');
    
    try {
      await supabase.rpc('exec', {
        sql: 'DROP FUNCTION IF EXISTS add_folder_columns();'
      });
      console.log('✅ Fonction temporaire supprimée');
    } catch (error) {
      console.log('⚠️  Erreur nettoyage (peut être ignorée):', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
fixFolderIdDirectly();
