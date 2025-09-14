// Script pour vérifier et corriger le schéma de la base de données
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const checkAndFixSchema = async () => {
  try {
    console.log('🔍 === VÉRIFICATION ET CORRECTION DU SCHÉMA ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Étape 1: Vérifier la structure actuelle de la table dossiers
    console.log('\n📋 1. Vérification de la structure de la table dossiers...');
    
    try {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'dossiers')
        .in('column_name', ['folderId', 'folderName'])
        .order('column_name');
      
      if (columnsError) {
        console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
      } else {
        console.log('📋 Colonnes trouvées dans dossiers:', columns);
        
        if (columns && columns.length >= 2) {
          console.log('✅ Les colonnes folderId et folderName existent déjà !');
        } else {
          console.log('❌ Les colonnes folderId et folderName n\'existent pas encore.');
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification:', error.message);
    }
    
    // Étape 2: Vérifier la structure de la table folders
    console.log('\n📋 2. Vérification de la structure de la table folders...');
    
    try {
      const { data: foldersColumns, error: foldersError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'folders')
        .eq('column_name', 'id');
      
      if (foldersError) {
        console.log('❌ Erreur lors de la vérification de la table folders:', foldersError.message);
      } else {
        console.log('📋 Structure de la table folders:', foldersColumns);
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification de folders:', error.message);
    }
    
    // Étape 3: Essayer de forcer la mise à jour du cache
    console.log('\n🔄 3. Tentative de mise à jour du cache de schéma...');
    
    try {
      // Essayer une requête simple pour forcer la mise à jour du cache
      const { data: testData, error: testError } = await supabase
        .from('dossiers')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.log('❌ Erreur lors du test de connexion:', testError.message);
      } else {
        console.log('✅ Connexion à la table dossiers réussie');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test de connexion:', error.message);
    }
    
    // Étape 4: Test d'insertion pour voir l'erreur exacte
    console.log('\n🧪 4. Test d\'insertion pour diagnostiquer l\'erreur...');
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `SCHEMA-TEST-${Date.now()}`,
      numeroNature: 'SCHEMA-TEST-NATURE',
      objetOperation: 'Test de diagnostic du schéma',
      beneficiaire: 'Test Schema Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { data: insertResult, error: insertError } = await supabase
        .from('dossiers')
        .insert(testDossier)
        .select();
      
      if (insertError) {
        console.log('❌ Erreur d\'insertion (sans folderId):', insertError.message);
      } else {
        console.log('✅ Insertion réussie (sans folderId):', insertResult[0].numeroDossier);
        
        // Nettoyer le test
        await supabase
          .from('dossiers')
          .delete()
          .eq('id', insertResult[0].id);
        
        console.log('🧹 Test nettoyé');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test d\'insertion:', error.message);
    }
    
    // Étape 5: Test avec folderId pour voir l'erreur exacte
    console.log('\n🧪 5. Test d\'insertion avec folderId...');
    
    const testDossierWithFolder = {
      id: crypto.randomUUID(),
      numeroDossier: `FOLDER-TEST-${Date.now()}`,
      numeroNature: 'FOLDER-TEST-NATURE',
      objetOperation: 'Test avec folderId',
      beneficiaire: 'Test Folder Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-schema',
      folderName: 'Test Folder Schema',
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      const { data: insertResult, error: insertError } = await supabase
        .from('dossiers')
        .insert(testDossierWithFolder)
        .select();
      
      if (insertError) {
        console.log('❌ Erreur d\'insertion (avec folderId):', insertError.message);
        
        if (insertError.message.includes('folderId')) {
          console.log('\n💡 DIAGNOSTIC: La colonne folderId n\'existe pas dans la table dossiers.');
          console.log('📝 SOLUTION: Exécutez le SQL suivant dans l\'interface Supabase:');
          console.log('');
          console.log('```sql');
          console.log('ALTER TABLE dossiers');
          console.log('ADD COLUMN IF NOT EXISTS folderId TEXT REFERENCES folders(id) ON DELETE SET NULL,');
          console.log('ADD COLUMN IF NOT EXISTS folderName TEXT;');
          console.log('');
          console.log('CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);');
          console.log('```');
          console.log('');
          console.log('📋 Instructions complètes dans: FINAL_FOLDERID_FIX.md');
        }
      } else {
        console.log('✅ Insertion réussie (avec folderId):', insertResult[0].numeroDossier);
        console.log('📁 FolderId:', insertResult[0].folderId);
        console.log('📁 FolderName:', insertResult[0].folderName);
        
        // Nettoyer le test
        await supabase
          .from('dossiers')
          .delete()
          .eq('id', insertResult[0].id);
        
        console.log('🧹 Test nettoyé');
        console.log('🎉 Le problème folderId est résolu !');
      }
    } catch (error) {
      console.log('❌ Erreur lors du test d\'insertion avec folderId:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
checkAndFixSchema();
