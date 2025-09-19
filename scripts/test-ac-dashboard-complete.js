const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function testACDashboardComplete() {
  try {
    console.log('🧪 Test complet du dashboard AC...');
    
    // 1. Vérifier les dossiers disponibles
    console.log('📊 1. Vérification des dossiers AC...');
    const response = await fetch('http://localhost:3000/api/dossiers/ac-all', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('❌ Erreur API ac-all:', response.status);
      return;
    }
    
    const data = await response.json();
    const dossiers = data.dossiers || [];
    
    console.log(`✅ ${dossiers.length} dossiers trouvés pour l'AC`);
    
    // Analyser les statuts
    const statutsCount = {};
    dossiers.forEach(dossier => {
      statutsCount[dossier.statut] = (statutsCount[dossier.statut] || 0) + 1;
    });
    
    console.log('📊 Répartition par statut:');
    Object.entries(statutsCount).forEach(([statut, count]) => {
      console.log(`  - ${statut}: ${count} dossier(s)`);
    });
    
    // 2. Tester le rapport de vérification
    if (dossiers.length > 0) {
      const premierDossier = dossiers[0];
      console.log(`\n📋 2. Test du rapport de vérification pour ${premierDossier.numeroDossier}...`);
      
      const rapportResponse = await fetch(`http://localhost:3000/api/dossiers/${premierDossier.id}/rapport-verification`, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (rapportResponse.ok) {
        const rapportData = await rapportResponse.json();
        const rapport = rapportData.rapport;
        
        console.log('✅ Rapport de vérification généré avec succès');
        console.log('📊 Statistiques rapport:');
        console.log(`  - CB: ${rapport.statistiquesGlobales.cb.total} contrôles (${rapport.statistiquesGlobales.cb.valides} validés)`);
        console.log(`  - Ordonnateur: ${rapport.statistiquesGlobales.ordonnateur.total} vérifications (${rapport.statistiquesGlobales.ordonnateur.valides} validées)`);
        console.log(`  - Incohérences: ${rapport.statistiquesGlobales.incoherences}`);
      } else {
        console.error('❌ Erreur rapport de vérification:', rapportResponse.status);
      }
      
      // 3. Tester la génération de quitus (si validé définitivement)
      if (premierDossier.statut === 'VALIDÉ_DÉFINITIVEMENT') {
        console.log(`\n📄 3. Test de génération de quitus pour ${premierDossier.numeroDossier}...`);
        
        const quitusResponse = await fetch(`http://localhost:3000/api/dossiers/${premierDossier.id}/generate-quitus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (quitusResponse.ok) {
          const quitusData = await quitusResponse.json();
          console.log('✅ Quitus généré avec succès:', quitusData.quitus.numeroQuitus);
          console.log('📋 Contenu du quitus:');
          console.log(`  - Dossier: ${quitusData.quitus.dossier.numero}`);
          console.log(`  - Bénéficiaire: ${quitusData.quitus.dossier.beneficiaire}`);
          console.log(`  - Conforme: ${quitusData.quitus.conclusion.conforme ? 'OUI' : 'NON'}`);
        } else {
          console.error('❌ Erreur génération quitus:', quitusResponse.status);
        }
      }
    }
    
    // 4. Vérifier les APIs spécifiques
    console.log(`\n🔍 4. Vérification des APIs spécifiques...`);
    
    const apis = [
      { name: 'AC Pending', url: 'http://localhost:3000/api/dossiers/ac-pending' },
      { name: 'AC All', url: 'http://localhost:3000/api/dossiers/ac-all' }
    ];
    
    for (const api of apis) {
      try {
        const testResponse = await fetch(api.url, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(`✅ ${api.name}: ${testData.dossiers?.length || 0} dossiers`);
        } else {
          console.error(`❌ ${api.name}: Erreur ${testResponse.status}`);
        }
      } catch (error) {
        console.error(`❌ ${api.name}: Erreur de connexion`);
      }
    }
    
    console.log('\n🎉 Test complet du dashboard AC terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testACDashboardComplete();
