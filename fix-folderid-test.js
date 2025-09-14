// Script pour tester et corriger le problème folderId
// Utilise les variables d'environnement du projet

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const testAndFixFolderId = async () => {
  try {
    console.log('🔍 === TEST ET CORRECTION FOLDERID ===');
    
    // Récupérer les variables d'environnement
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
      return;
    }
    
    console.log('✅ Variables d\'environnement trouvées');
    
    // Utiliser la clé service pour les opérations admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Étape 1: Vérifier la structure actuelle de la table dossiers
    console.log('\n📋 1. Vérification de la structure de la table dossiers...');
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'dossiers' 
          AND column_name IN ('folderId', 'folderName')
          ORDER BY column_name;
        `
      });
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
    } else {
      console.log('📋 Colonnes trouvées:', columns);
    }
    
    // Étape 2: Ajouter les colonnes si elles n'existent pas
    console.log('\n🔧 2. Ajout des colonnes manquantes...');
    
    const addColumnsQuery = `
      -- Ajouter les colonnes folderId et folderName à la table dossiers
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS folderId UUID REFERENCES folders(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS folderName TEXT;
      
      -- Créer un index sur folderId pour les performances
      CREATE INDEX IF NOT EXISTS idx_dossiers_folder_id ON dossiers(folderId);
      
      -- Ajouter des commentaires
      COMMENT ON COLUMN dossiers.folderId IS 'ID du dossier parent dans la table folders';
      COMMENT ON COLUMN dossiers.folderName IS 'Nom du dossier parent pour affichage rapide';
    `;
    
    const { data: addResult, error: addError } = await supabase
      .rpc('exec_sql', {
        query: addColumnsQuery
      });
    
    if (addError) {
      console.error('❌ Erreur lors de l\'ajout des colonnes:', addError);
    } else {
      console.log('✅ Colonnes ajoutées avec succès');
    }
    
    // Étape 3: Vérifier que les colonnes ont été ajoutées
    console.log('\n✅ 3. Vérification finale...');
    
    const { data: finalCheck, error: finalError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'dossiers' 
          AND column_name IN ('folderId', 'folderName')
          ORDER BY column_name;
        `
      });
    
    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('📋 Colonnes finales:', finalCheck);
      
      if (finalCheck && finalCheck.length >= 2) {
        console.log('🎉 SUCCÈS: Les colonnes folderId et folderName ont été ajoutées !');
      } else {
        console.log('⚠️  ATTENTION: Les colonnes ne semblent pas avoir été ajoutées correctement');
      }
    }
    
    // Étape 4: Test d'insertion
    console.log('\n🧪 4. Test d\'insertion...');
    
    const testDossier = {
      numeroDossier: `TEST-${Date.now()}`,
      numeroNature: 'TEST-NATURE',
      objetOperation: 'Test de soumission après correction',
      beneficiaire: 'Test Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: 'cmecmvbvy0000c1ecbq58lmtm',
      folderId: 'test-folder-id',
      folderName: 'Test Folder',
      statut: 'EN_ATTENTE'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select();
    
    if (insertError) {
      console.error('❌ Erreur lors du test d\'insertion:', insertError);
    } else {
      console.log('✅ Test d\'insertion réussi:', insertResult[0].numeroDossier);
      
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

// Exécuter le script
testAndFixFolderId();
