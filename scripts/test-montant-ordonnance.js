const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function testMontantOrdonnance() {
  try {
    console.log('🧪 Test de la colonne montantOrdonnance...');
    
    // Tester l'insertion d'un dossier avec montantOrdonnance
    const testDossier = {
      numeroDossier: 'TEST-ORD-' + Date.now(),
      numeroNature: 'TEST',
      objetOperation: 'Test ordonnancement',
      beneficiaire: 'Test Beneficiaire',
      statut: 'VALIDÉ_CB',
      dateDepot: new Date().toISOString(),
      montantOrdonnance: 1500.50,
      posteComptableId: 'test-poste',
      natureDocumentId: 'test-nature',
      secretaireId: 'test-secretaire'
    };
    
    console.log('📝 Insertion d\'un dossier de test...');
    const { data: insertData, error: insertError } = await admin
      .from('dossiers')
      .insert([testDossier])
      .select();
    
    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
      return;
    }
    
    console.log('✅ Dossier inséré avec succès:', insertData[0].id);
    
    // Tester la récupération
    console.log('📖 Récupération du dossier...');
    const { data: fetchData, error: fetchError } = await admin
      .from('dossiers')
      .select('*')
      .eq('id', insertData[0].id)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError);
      return;
    }
    
    console.log('✅ Dossier récupéré avec succès');
    console.log('💰 Montant ordonnance:', fetchData.montantOrdonnance);
    
    // Nettoyer le dossier de test
    console.log('🧹 Nettoyage du dossier de test...');
    const { error: deleteError } = await admin
      .from('dossiers')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.warn('⚠️ Avertissement suppression:', deleteError.message);
    } else {
      console.log('✅ Dossier de test supprimé');
    }
    
    console.log('🎉 Test réussi ! La colonne montantOrdonnance fonctionne correctement.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testMontantOrdonnance();
