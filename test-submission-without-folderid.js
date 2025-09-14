// Script pour tester la soumission de dossiers sans les colonnes folderId
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const testSubmissionWithoutFolderId = async () => {
  try {
    console.log('🧪 === TEST DE SOUMISSION SANS FOLDERID ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 1: Créer un dossier de test dans la table folders
    console.log('\n📁 1. Création d\'un dossier de test...');
    
    const testFolder = {
      id: crypto.randomUUID(),
      name: `Test Folder ${Date.now()}`,
      description: 'Dossier de test pour la soumission',
      authorId: 'cmebotahv0000c17w3izkh2k9', // Utiliser un ID d'utilisateur valide
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data: folderResult, error: folderError } = await supabase
      .from('folders')
      .insert(testFolder)
      .select()
      .single();
    
    if (folderError) {
      console.log('❌ Erreur création dossier:', folderError.message);
      return;
    }
    
    console.log('✅ Dossier créé:', folderResult.name);
    
    // Test 2: Tester la soumission via l'API
    console.log('\n📤 2. Test de soumission via l\'API...');
    
    const submissionData = {
      numeroDossier: `TEST-SUB-${Date.now()}`,
      numeroNature: 'TEST-NATURE',
      objetOperation: 'Test de soumission sans folderId',
      beneficiaire: 'Test Beneficiaire',
      posteComptableId: null,
      natureDocumentId: null,
      secretaireId: null
    };
    
    // Essayer directement avec l'URL locale
    console.log('\n🔄 Test avec l\'URL locale...');
    
    try {
      const localResponse = await fetch(`http://localhost:3000/api/folders/${folderResult.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify(submissionData)
      });
      
      if (localResponse.ok) {
        const result = await localResponse.json();
        console.log('✅ Soumission réussie via API locale:', result.message);
        console.log('📄 Dossier soumis:', result.dossier?.numeroDossier);
      } else {
        const errorData = await localResponse.text();
        console.log('❌ Erreur soumission API locale:', errorData);
      }
    } catch (localError) {
      console.log('❌ Erreur API locale:', localError.message);
    }
    
    // Test 3: Vérifier que le dossier a été créé dans la table dossiers
    console.log('\n📋 3. Vérification de la création du dossier comptable...');
    
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('numeroDossier', submissionData.numeroDossier)
      .limit(1);
    
    if (dossiersError) {
      console.log('❌ Erreur vérification dossiers:', dossiersError.message);
    } else if (dossiers && dossiers.length > 0) {
      console.log('✅ Dossier comptable créé:', dossiers[0].numeroDossier);
      console.log('📊 Statut:', dossiers[0].statut);
      
      // Nettoyer le dossier comptable
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', dossiers[0].id);
      
      console.log('🧹 Dossier comptable nettoyé');
    } else {
      console.log('❌ Aucun dossier comptable trouvé');
    }
    
    // Nettoyer le dossier de test
    await supabase
      .from('folders')
      .delete()
      .eq('id', folderResult.id);
    
    console.log('🧹 Dossier de test nettoyé');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
testSubmissionWithoutFolderId();
