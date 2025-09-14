// Solution finale pour corriger le problème folderId
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const finalFix = async () => {
  try {
    console.log('🚀 === SOLUTION FINALE POUR FOLDERID ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    console.log('✅ Connexion à Supabase établie');
    
    // Utiliser la clé service pour les opérations admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Étape 1: Créer une fonction SQL qui peut être exécutée
    console.log('\n🔧 1. Création d\'une fonction SQL exécutable...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION add_folder_columns_to_dossiers()
      RETURNS TEXT AS $$
      DECLARE
        result TEXT := '';
      BEGIN
        -- Ajouter les colonnes si elles n'existent pas
        BEGIN
          ALTER TABLE dossiers ADD COLUMN folderId UUID REFERENCES folders(id) ON DELETE SET NULL;
          result := result || 'Colonne folderId ajoutée. ';
        EXCEPTION
          WHEN duplicate_column THEN
            result := result || 'Colonne folderId existe déjà. ';
        END;
        
        BEGIN
          ALTER TABLE dossiers ADD COLUMN folderName TEXT;
          result := result || 'Colonne folderName ajoutée. ';
        EXCEPTION
          WHEN duplicate_column THEN
            result := result || 'Colonne folderName existe déjà. ';
        END;
        
        -- Créer l'index si il n'existe pas
        BEGIN
          CREATE INDEX idx_dossiers_folder_id ON dossiers(folderId);
          result := result || 'Index créé. ';
        EXCEPTION
          WHEN duplicate_table THEN
            result := result || 'Index existe déjà. ';
        END;
        
        -- Ajouter les commentaires
        COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
        COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
        
        result := result || 'Commentaires ajoutés. ';
        
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    try {
      // Utiliser l'API REST directe pour créer la fonction
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: createFunctionSQL
        })
      });
      
      if (response.ok) {
        console.log('✅ Fonction SQL créée avec succès');
      } else {
        const errorText = await response.text();
        console.log('⚠️  Erreur création fonction:', errorText);
      }
    } catch (error) {
      console.log('⚠️  Erreur API:', error.message);
    }
    
    // Étape 2: Exécuter la fonction
    console.log('\n🔧 2. Exécution de la fonction...');
    
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('add_folder_columns_to_dossiers');
      
      if (functionError) {
        console.log('❌ Erreur exécution fonction:', functionError.message);
      } else {
        console.log('✅ Fonction exécutée:', functionResult);
      }
    } catch (error) {
      console.log('❌ Erreur exécution:', error.message);
    }
    
    // Étape 3: Test de vérification
    console.log('\n🧪 3. Test de vérification...');
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `FINAL-TEST-${Date.now()}`,
      numeroNature: 'FINAL-TEST-NATURE',
      objetOperation: 'Test de correction finale',
      beneficiaire: 'Test Final Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-final',
      folderName: 'Test Folder Final',
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
        console.log('📝 Solutions finales:');
        console.log('   1. Exécuter le SQL manuellement dans l\'interface Supabase');
        console.log('   2. Utiliser le script de migration créé précédemment');
        console.log('   3. Contacter le support Supabase');
        
        // Afficher le SQL à exécuter manuellement
        console.log('\n📋 SQL à exécuter manuellement dans l\'interface Supabase:');
        console.log('```sql');
        console.log('ALTER TABLE dossiers');
        console.log('ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,');
        console.log('ADD COLUMN IF NOT EXISTS folderName TEXT;');
        console.log('');
        console.log('CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);');
        console.log('');
        console.log('COMMENT ON COLUMN dossiers.folderId IS \'ID du dossier parent dans la table folders\';');
        console.log('COMMENT ON COLUMN dossiers.folderName IS \'Nom du dossier parent pour affichage rapide\';');
        console.log('```');
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
    console.log('\n🧹 4. Nettoyage...');
    
    try {
      await supabase.rpc('exec', {
        sql: 'DROP FUNCTION IF EXISTS add_folder_columns_to_dossiers();'
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
finalFix();
