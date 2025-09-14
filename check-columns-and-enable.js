// Script pour vérifier si les colonnes folderId et folderName existent et les activer
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const checkColumnsAndEnable = async () => {
  try {
    console.log('🔍 === VÉRIFICATION ET ACTIVATION DES COLONNES ===');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement manquantes');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 1: Vérifier si les colonnes existent en essayant d'insérer un dossier avec folderId
    console.log('\n🧪 1. Test d\'insertion avec folderId...');
    
    const testDossier = {
      id: crypto.randomUUID(),
      numeroDossier: `COLUMN-TEST-${Date.now()}`,
      numeroNature: 'COLUMN-TEST-NATURE',
      objetOperation: 'Test de vérification des colonnes',
      beneficiaire: 'Test Column Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-column',
      folderName: 'Test Folder Column',
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select();
    
    if (insertError) {
      if (insertError.message.includes('folderId')) {
        console.log('❌ Les colonnes folderId et folderName n\'existent pas encore.');
        console.log('📝 Vous devez d\'abord exécuter le SQL dans l\'interface Supabase.');
        console.log('');
        console.log('🔗 Allez sur: https://supabase.com/dashboard');
        console.log('📋 Sélectionnez votre projet ACGE');
        console.log('🔧 Allez dans l\'onglet "SQL Editor"');
        console.log('📝 Exécutez le SQL suivant:');
        console.log('');
        console.log('```sql');
        console.log('ALTER TABLE dossiers');
        console.log('ADD COLUMN IF NOT EXISTS folderId TEXT,');
        console.log('ADD COLUMN IF NOT EXISTS folderName TEXT;');
        console.log('');
        console.log('CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);');
        console.log('```');
        console.log('');
        console.log('🔄 Après avoir exécuté le SQL, relancez ce script pour activer les colonnes.');
        return;
      } else {
        console.log('❌ Autre erreur d\'insertion:', insertError.message);
        return;
      }
    } else {
      console.log('✅ SUCCÈS: Les colonnes folderId et folderName existent !');
      console.log('📄 Dossier créé:', insertResult[0].numeroDossier);
      console.log('📁 FolderId:', insertResult[0].folderId);
      console.log('📁 FolderName:', insertResult[0].folderName);
      
      // Nettoyer le test
      await supabase
        .from('dossiers')
        .delete()
        .eq('id', insertResult[0].id);
      
      console.log('🧹 Test nettoyé');
      
      // Activer les colonnes dans le code
      console.log('\n🔧 2. Activation des colonnes dans le code...');
      
      // Lire le fichier de l'API
      const fs = require('fs');
      const path = require('path');
      
      const apiFilePath = path.join(__dirname, 'src', 'app', 'api', 'folders', '[id]', 'submit', 'route.ts');
      
      try {
        let apiContent = fs.readFileSync(apiFilePath, 'utf8');
        
        // Remplacer les lignes commentées par les lignes actives
        apiContent = apiContent.replace(
          /\/\/ folderId: folderId, \/\/ TEMPORAIRE: Commenté jusqu'à ce que la colonne soit créée/,
          'folderId: folderId, // Colonne activée'
        );
        
        apiContent = apiContent.replace(
          /\/\/ folderName: existingFolder\.name, \/\/ TEMPORAIRE: Commenté jusqu'à ce que la colonne soit créée/,
          'folderName: existingFolder.name, // Colonne activée'
        );
        
        // Écrire le fichier modifié
        fs.writeFileSync(apiFilePath, apiContent);
        
        console.log('✅ Colonnes activées dans le code API');
        console.log('🎉 La soumission de dossiers avec folderId et folderName est maintenant activée !');
        
      } catch (fileError) {
        console.log('⚠️  Erreur lors de la modification du fichier:', fileError.message);
        console.log('📝 Vous pouvez activer manuellement les colonnes en décommentant les lignes dans:');
        console.log('   src/app/api/folders/[id]/submit/route.ts');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
};

// Exécuter le script
checkColumnsAndEnable();
