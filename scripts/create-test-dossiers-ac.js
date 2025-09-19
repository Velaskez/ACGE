const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function createTestDossiersAC() {
  try {
    console.log('🧪 Création de dossiers de test pour l\'AC...');
    
    // Récupérer les IDs nécessaires
    const { data: postes } = await admin.from('postes_comptables').select('id').limit(1);
    const { data: natures } = await admin.from('natures_documents').select('id').limit(1);
    const { data: users } = await admin.from('users').select('id').eq('role', 'SECRETAIRE').limit(1);
    
    if (!postes || !natures || !users) {
      console.error('❌ Impossible de récupérer les données de référence');
      return;
    }
    
    const posteId = postes[0].id;
    const natureId = natures[0].id;
    const secretaireId = users[0].id;
    
    // Créer des dossiers de test avec différents statuts
    const { randomUUID } = require('crypto');
    
    const testDossiers = [
      {
        id: randomUUID(),
        numeroDossier: 'TEST-AC-001',
        numeroNature: 'TEST-001',
        objetOperation: 'Test dossier en attente validation AC',
        beneficiaire: 'Bénéficiaire Test 1',
        statut: 'VALIDÉ_ORDONNATEUR',
        dateDepot: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posteComptableId: posteId,
        natureDocumentId: natureId,
        secretaireId: secretaireId
      },
      {
        id: randomUUID(),
        numeroDossier: 'TEST-AC-002',
        numeroNature: 'TEST-002',
        objetOperation: 'Test dossier payé',
        beneficiaire: 'Bénéficiaire Test 2',
        statut: 'PAYÉ',
        dateDepot: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posteComptableId: posteId,
        natureDocumentId: natureId,
        secretaireId: secretaireId
      },
      {
        id: randomUUID(),
        numeroDossier: 'TEST-AC-003',
        numeroNature: 'TEST-003',
        objetOperation: 'Test recette enregistrée',
        beneficiaire: 'Bénéficiaire Test 3',
        statut: 'RECETTE_ENREGISTRÉE',
        dateDepot: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posteComptableId: posteId,
        natureDocumentId: natureId,
        secretaireId: secretaireId
      },
      {
        id: randomUUID(),
        numeroDossier: 'TEST-AC-004',
        numeroNature: 'TEST-004',
        objetOperation: 'Test dossier terminé',
        beneficiaire: 'Bénéficiaire Test 4',
        statut: 'TERMINÉ',
        dateDepot: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        posteComptableId: posteId,
        natureDocumentId: natureId,
        secretaireId: secretaireId
      }
    ];
    
    console.log('📝 Insertion des dossiers de test...');
    const { data: insertedDossiers, error: insertError } = await admin
      .from('dossiers')
      .insert(testDossiers)
      .select();
    
    if (insertError) {
      console.error('❌ Erreur insertion dossiers:', insertError);
      return;
    }
    
    console.log(`✅ ${insertedDossiers.length} dossiers de test créés avec succès`);
    
    // Afficher les IDs créés pour pouvoir les supprimer plus tard
    console.log('📋 Dossiers créés:');
    insertedDossiers.forEach(dossier => {
      console.log(`  - ${dossier.numeroDossier} (${dossier.id}) - Statut: ${dossier.statut}`);
    });
    
    // 2. Tester l'API ac-all avec les nouveaux dossiers
    console.log('\n📊 2. Test de l\'API ac-all...');
    const testResponse = await fetch('http://localhost:3000/api/dossiers/ac-all', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log(`✅ API ac-all: ${testData.dossiers.length} dossiers retournés`);
      
      // Compter par statut
      const counts = {};
      testData.dossiers.forEach(d => {
        counts[d.statut] = (counts[d.statut] || 0) + 1;
      });
      
      console.log('📊 Répartition mise à jour:');
      Object.entries(counts).forEach(([statut, count]) => {
        console.log(`  - ${statut}: ${count} dossier(s)`);
      });
    } else {
      console.error('❌ Erreur test API ac-all');
    }
    
    console.log('\n🎉 Test terminé ! Les filtres peuvent maintenant être testés dans l\'interface.');
    console.log('💡 Pour nettoyer les dossiers de test, utilisez leurs IDs affichés ci-dessus.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

createTestDossiersAC();
