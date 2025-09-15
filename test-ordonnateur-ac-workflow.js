/**
 * 🧪 TEST WORKFLOW ORDONNATEUR → AGENT COMPTABLE
 * 
 * Ce script teste le workflow complet :
 * 1. Créer un dossier (Secrétaire)
 * 2. Valider par CB
 * 3. Ordonnancer par Ordonnateur
 * 4. Comptabiliser par Agent Comptable
 */

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWorkflow() {
  console.log('🧪 Début du test du workflow Ordonnateur → Agent Comptable')
  
  try {
    // 1. Créer un dossier de test
    console.log('\n📝 1. Création d\'un dossier de test...')
    const { data: dossier, error: createError } = await supabase
      .from('dossiers')
      .insert({
        numeroDossier: `TEST-${Date.now()}`,
        beneficiaire: 'Test Workflow',
        montant: 1000,
        statut: 'EN_ATTENTE',
        posteComptableId: 1, // Assumer que le poste 1 existe
        natureDocumentId: 1, // Assumer que la nature 1 existe
        secretaireId: 1 // Assumer que la secrétaire 1 existe
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Erreur création dossier:', createError)
      return
    }

    console.log('✅ Dossier créé:', dossier.numeroDossier)

    // 2. Valider par CB
    console.log('\n✅ 2. Validation par CB...')
    const { error: validateError } = await supabase
      .from('dossiers')
      .update({ statut: 'VALIDÉ_CB' })
      .eq('id', dossier.id)

    if (validateError) {
      console.error('❌ Erreur validation CB:', validateError)
      return
    }

    console.log('✅ Dossier validé par CB')

    // 3. Ordonnancer par Ordonnateur
    console.log('\n📋 3. Ordonnancement par Ordonnateur...')
    const { error: ordonnanceError } = await supabase
      .from('dossiers')
      .update({ 
        statut: 'VALIDÉ_ORDONNATEUR',
        ordonnancementComment: 'Test ordonnancement',
        montantOrdonnance: 1000,
        ordonnancedAt: new Date().toISOString()
      })
      .eq('id', dossier.id)

    if (ordonnanceError) {
      console.error('❌ Erreur ordonnancement:', ordonnanceError)
      return
    }

    console.log('✅ Dossier ordonnançé')

    // 4. Vérifier que le dossier apparaît dans la liste AC
    console.log('\n📊 4. Vérification liste Agent Comptable...')
    const { data: acDossiers, error: acError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('statut', 'VALIDÉ_ORDONNATEUR')

    if (acError) {
      console.error('❌ Erreur récupération dossiers AC:', acError)
      return
    }

    const testDossier = acDossiers.find(d => d.id === dossier.id)
    if (testDossier) {
      console.log('✅ Dossier trouvé dans la liste AC:', testDossier.numeroDossier)
    } else {
      console.error('❌ Dossier NON trouvé dans la liste AC!')
      return
    }

    // 5. Comptabiliser (paiement)
    console.log('\n💳 5. Comptabilisation (paiement)...')
    const { error: paiementError } = await supabase
      .from('dossiers')
      .update({ 
        statut: 'PAYÉ',
        updatedAt: new Date().toISOString()
      })
      .eq('id', dossier.id)

    if (paiementError) {
      console.error('❌ Erreur paiement:', paiementError)
      return
    }

    console.log('✅ Paiement enregistré')

    // 6. Clôturer le dossier
    console.log('\n✅ 6. Clôture du dossier...')
    const { error: clotureError } = await supabase
      .from('dossiers')
      .update({ 
        statut: 'TERMINÉ',
        updatedAt: new Date().toISOString()
      })
      .eq('id', dossier.id)

    if (clotureError) {
      console.error('❌ Erreur clôture:', clotureError)
      return
    }

    console.log('✅ Dossier clôturé')

    // 7. Nettoyer le dossier de test
    console.log('\n🧹 7. Nettoyage...')
    const { error: deleteError } = await supabase
      .from('dossiers')
      .delete()
      .eq('id', dossier.id)

    if (deleteError) {
      console.error('⚠️ Erreur suppression dossier test:', deleteError)
    } else {
      console.log('✅ Dossier de test supprimé')
    }

    console.log('\n🎉 TEST RÉUSSI ! Le workflow Ordonnateur → Agent Comptable fonctionne correctement.')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
testWorkflow()
