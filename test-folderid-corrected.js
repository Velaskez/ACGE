// Script de test corrigé pour vérifier que la correction folderId fonctionne avec le bon type
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const testFolderIdCorrected = async () => {
  try {
    console.log('🧪 === TEST DE VÉRIFICATION FOLDERID CORRIGÉ ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 1: Vérifier la structure de la table folders
    console.log('\n📋 1. Vérification de la structure de la table folders...');
    
    const { data: foldersColumns, error: foldersError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'folders')
      .eq('column_name', 'id');
    
    if (foldersError) {
      console.error('❌ Erreur lors de la vérification de la table folders:', foldersError);
    } else {
      console.log('📋 Structure de la table folders:', foldersColumns);
    }
    
    // Test 2: Vérifier la structure de la table dossiers
    console.log('\n📋 2. Vérification de la structure de la table dossiers...');
    
    const { data: dossiersColumns, error: dossiersError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'dossiers')
      .in('column_name', ['folderId', 'folderName']);
    
    if (dossiersError) {
      console.error('❌ Erreur lors de la vérification de la table dossiers:', dossiersError);
    } else {
      console.log('📋 Structure de la table dossiers:', dossiersColumns);
    }
    
    // Test 3: Essayer d'insérer un dossier de test avec folderId (TEXT)
    console.log('\n🧪 3. Test d\'insertion avec folderId (type TEXT)...');
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `CORRECTED-TEST-${Date.now()}`,
      numeroNature: 'CORRECTED-TEST-NATURE',
      objetOperation: 'Test de correction avec type TEXT',
      beneficiaire: 'Test Corrected Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-corrected', // Type TEXT
      folderName: 'Test Folder Corrected',
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select();
    
    if (insertError) {
      console.log('❌ Erreur d\'insertion:', insertError.message);
      
      if (insertError.message.includes('folderId')) {
        console.log('💡 La colonne folderId n\'existe toujours pas ou a un type incorrect.');
        console.log('📝 Veuillez exécuter le SQL corrigé dans l\'interface Supabase (voir fix-folderid-corrected.sql)');
      } else {
        console.log('🔍 Autre erreur:', insertError);
      }
    } else {
      console.log('✅ SUCCÈS: Insertion réussie avec folderId (TEXT) !');
      console.log('📄 Dossier créé:', insertResult[0].numeroDossier);
      console.log('📁 FolderId:', insertResult[0].folderId);
      console.log('📁 FolderName:', insertResult[0].folderName);
      
      // Nettoyer le dossier de test
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', insertResult[0].id);
      
      console.log('🧹 Dossier de test supprimé');
      console.log('🎉 La correction folderId fonctionne parfaitement avec le type TEXT !');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le test
testFolderIdCorrected();
