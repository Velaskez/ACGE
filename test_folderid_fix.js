// Script de test pour vérifier que les colonnes folderId et folderName existent
// À exécuter dans la console du navigateur ou via Node.js

const testFolderIdColumns = async () => {
  try {
    // Test de connexion à Supabase
    const { createClient } = await import('@supabase/supabase-js');
    
    // Remplacez ces valeurs par vos vraies clés Supabase
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test 1: Vérifier la structure de la table dossiers
    console.log('🔍 Vérification de la structure de la table dossiers...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'dossiers')
      .in('column_name', ['folderId', 'folderName']);
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return;
    }
    
    console.log('📋 Colonnes trouvées:', columns);
    
    // Test 2: Essayer d'insérer un dossier de test avec folderId
    console.log('🧪 Test d\'insertion avec folderId...');
    
    const testDossier = {
      numeroDossier: `TEST-${Date.now()}`,
      numeroNature: 'TEST-NATURE',
      objetOperation: 'Test de soumission',
      beneficiaire: 'Test Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-id', // Ceci devrait maintenant fonctionner
      folderName: 'Test Folder',
      statut: 'EN_ATTENTE'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select();
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion de test:', insertError);
    } else {
      console.log('✅ Insertion réussie:', insertResult);
      
      // Nettoyer le dossier de test
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', insertResult[0].id);
      
      console.log('🧹 Dossier de test supprimé');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le test
testFolderIdColumns();
