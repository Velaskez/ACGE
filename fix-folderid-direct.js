// Script pour corriger le problème folderId en utilisant l'API REST directe
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const fixFolderIdColumns = async () => {
  try {
    console.log('🔍 === CORRECTION FOLDERID VIA API REST ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    // Utiliser la clé service pour les opérations admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('✅ Connexion à Supabase établie');
    
    // Étape 1: Vérifier la structure actuelle
    console.log('\n📋 1. Vérification de la structure actuelle...');
    
    try {
      // Essayer d'insérer un dossier de test pour voir l'erreur exacte
      const testDossier = {
        numeroDossier: `TEST-${Date.now()}`,
        numeroNature: 'TEST-NATURE',
        objetOperation: 'Test de structure',
        beneficiaire: 'Test Beneficiaire',
        posteComptableId: 'default-poste-id',
        natureDocumentId: 'default-nature-id',
        secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
        statut: 'EN_ATTENTE'
      };
      
      const { data: testResult, error: testError } = await supabase
        .from('dossiers')
        .insert(testDossier)
        .select();
      
      if (testError) {
        console.log('❌ Erreur attendue (structure actuelle):', testError.message);
      } else {
        console.log('✅ Structure de base fonctionne');
        // Nettoyer le test
        await supabase.from('dossiers').delete().eq('id', testResult[0].id);
      }
    } catch (error) {
      console.log('❌ Erreur de test:', error.message);
    }
    
    // Étape 2: Utiliser l'API REST directe pour exécuter SQL
    console.log('\n🔧 2. Ajout des colonnes via API REST...');
    
    const addColumnsSQL = `
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folderName TEXT;
      
      CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
      
      COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
      COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
    `;
    
    try {
      // Utiliser l'endpoint SQL de Supabase
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          query: addColumnsSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ Colonnes ajoutées avec succès via API REST');
      } else {
        const errorData = await response.text();
        console.log('❌ Erreur API REST:', errorData);
        
        // Essayer une approche alternative avec l'endpoint SQL direct
        console.log('\n🔄 Tentative avec endpoint SQL direct...');
        
        const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
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
        
        if (sqlResponse.ok) {
          console.log('✅ Colonnes ajoutées via endpoint SQL direct');
        } else {
          const sqlError = await sqlResponse.text();
          console.log('❌ Erreur endpoint SQL:', sqlError);
        }
      }
    } catch (apiError) {
      console.log('❌ Erreur API:', apiError.message);
    }
    
    // Étape 3: Test final
    console.log('\n🧪 3. Test final avec folderId...');
    
    const finalTestDossier = {
      numeroDossier: `FINAL-TEST-${Date.now()}`,
      numeroNature: 'FINAL-TEST-NATURE',
      objetOperation: 'Test final après correction',
      beneficiaire: 'Test Final Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-id',
      folderName: 'Test Folder Final',
      statut: 'EN_ATTENTE'
    };
    
    const { data: finalResult, error: finalError } = await supabase
      .from('dossiers')
      .insert(finalTestDossier)
      .select();
    
    if (finalError) {
      console.log('❌ Erreur lors du test final:', finalError.message);
      console.log('💡 Vous devrez peut-être exécuter le SQL manuellement dans l\'interface Supabase');
    } else {
      console.log('🎉 SUCCÈS: Le test final a réussi !');
      console.log('✅ Dossier créé:', finalResult[0].numeroDossier);
      
      // Nettoyer le test final
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', finalResult[0].id);
      
      console.log('🧹 Test final nettoyé');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
fixFolderIdColumns();
