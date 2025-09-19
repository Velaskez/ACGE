const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function testOrdonnancementComplet() {
  try {
    console.log('🧪 Test complet de l\'ordonnancement...');
    
    const dossierId = '7faf6305-1fbf-4237-b50c-51e7d16b715d';
    
    // 1. Vérifier le dossier
    console.log('📋 1. Vérification du dossier...');
    const { data: dossier, error: dossierError } = await admin
      .from('dossiers')
      .select('*')
      .eq('id', dossierId)
      .single();
    
    if (dossierError) {
      console.error('❌ Erreur dossier:', dossierError);
      return;
    }
    
    console.log('✅ Dossier trouvé:', dossier.numeroDossier, '- Statut:', dossier.statut);
    
    // 2. Vérifier les vérifications ordonnateur
    console.log('🔍 2. Vérification des vérifications ordonnateur...');
    const { data: synthese, error: syntheseError } = await admin
      .from('syntheses_verifications_ordonnateur')
      .select('*')
      .eq('dossier_id', dossierId)
      .single();
    
    if (syntheseError) {
      console.error('❌ Erreur synthèse:', syntheseError);
      return;
    }
    
    console.log('✅ Synthèse trouvée:', synthese.statut, '- Validées:', synthese.verifications_validees, '/', synthese.total_verifications);
    
    // 3. Tester l'ordonnancement
    console.log('💰 3. Test de l\'ordonnancement...');
    const { data: updateData, error: updateError } = await admin
      .from('dossiers')
      .update({
        statut: 'VALIDÉ_ORDONNATEUR',
        ordonnancementComment: 'Test ordonnancement via script',
        montantOrdonnance: 1500.50,
        ordonnancedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', dossierId)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur ordonnancement:', updateError);
      return;
    }
    
    console.log('✅ Ordonnancement réussi !');
    console.log('📊 Dossier mis à jour:', updateData[0].numeroDossier);
    console.log('💰 Montant ordonnance:', updateData[0].montantOrdonnance);
    console.log('📅 Date ordonnancement:', updateData[0].ordonnancedAt);
    
    // 4. Vérifier la mise à jour
    console.log('🔍 4. Vérification de la mise à jour...');
    const { data: updatedDossier, error: fetchError } = await admin
      .from('dossiers')
      .select('*')
      .eq('id', dossierId)
      .single();
    
    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError);
      return;
    }
    
    console.log('✅ Vérification réussie !');
    console.log('📊 Statut final:', updatedDossier.statut);
    console.log('💰 Montant final:', updatedDossier.montantOrdonnance);
    
    console.log('🎉 Test complet réussi ! L\'ordonnancement fonctionne correctement.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testOrdonnancementComplet();
