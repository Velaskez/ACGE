/**
 * 🧪 TEST SIMPLE WORKFLOW
 * 
 * Teste simplement la connexion et les données
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔗 Configuration Supabase:')
console.log('URL:', supabaseUrl ? '✅ Configuré' : '❌ Manquant')
console.log('Service Key:', supabaseServiceKey ? '✅ Configuré' : '❌ Manquant')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSimple() {
  console.log('\n🧪 Test de connexion et données...')
  
  try {
    // 1. Tester la connexion
    console.log('\n1. Test de connexion...')
    const { data: testData, error: testError } = await supabase
      .from('dossiers')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Erreur connexion:', testError)
      return
    }

    console.log('✅ Connexion Supabase réussie')

    // 2. Vérifier les dossiers existants
    console.log('\n2. Vérification des dossiers...')
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select('id, numeroDossier, statut')
      .limit(5)

    if (dossiersError) {
      console.error('❌ Erreur récupération dossiers:', dossiersError)
      return
    }

    console.log(`✅ ${dossiers.length} dossiers trouvés:`)
    dossiers.forEach(d => {
      console.log(`  - ${d.numeroDossier} (${d.statut})`)
    })

    // 3. Vérifier les dossiers en attente d'ordonnancement
    console.log('\n3. Dossiers en attente d\'ordonnancement...')
    const { data: ordonnateurDossiers, error: ordError } = await supabase
      .from('dossiers')
      .select('id, numeroDossier, statut')
      .eq('statut', 'VALIDÉ_CB')

    if (ordError) {
      console.error('❌ Erreur récupération dossiers ordonnateur:', ordError)
      return
    }

    console.log(`✅ ${ordonnateurDossiers.length} dossiers en attente d'ordonnancement`)

    // 4. Vérifier les dossiers en attente de comptabilisation
    console.log('\n4. Dossiers en attente de comptabilisation...')
    const { data: acDossiers, error: acError } = await supabase
      .from('dossiers')
      .select('id, numeroDossier, statut')
      .eq('statut', 'VALIDÉ_ORDONNATEUR')

    if (acError) {
      console.error('❌ Erreur récupération dossiers AC:', acError)
      return
    }

    console.log(`✅ ${acDossiers.length} dossiers en attente de comptabilisation`)

    console.log('\n🎉 Test simple réussi ! Les APIs devraient fonctionner.')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
testSimple()
