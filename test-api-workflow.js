/**
 * 🧪 TEST WORKFLOW VIA API
 * 
 * Teste le workflow via les API endpoints
 */

async function testWorkflowAPI() {
  console.log('🧪 Test du workflow via API')
  
  try {
    // 1. Créer un dossier via l'API
    console.log('\n📝 1. Création d\'un dossier via API...')
    const createResponse = await fetch('http://localhost:3000/api/documents/dossiers-comptables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numeroNature: `TEST-API-${Date.now()}`,
        objetOperation: 'Test API Workflow',
        beneficiaire: 'Test API Workflow',
        posteComptableId: 1,
        natureDocumentId: 1
      })
    })

    if (!createResponse.ok) {
      const error = await createResponse.json()
      console.error('❌ Erreur création dossier:', error)
      return
    }

    const { dossier } = await createResponse.json()
    console.log('✅ Dossier créé:', dossier.numeroDossier)

    // 2. Valider par CB
    console.log('\n✅ 2. Validation par CB...')
    const validateResponse = await fetch(`http://localhost:3000/api/dossiers/${dossier.id}/validate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: 'Test validation CB' })
    })

    if (!validateResponse.ok) {
      const error = await validateResponse.json()
      console.error('❌ Erreur validation CB:', error)
      return
    }

    console.log('✅ Dossier validé par CB')

    // 3. Ordonnancer
    console.log('\n📋 3. Ordonnancement...')
    const ordonnanceResponse = await fetch(`http://localhost:3000/api/dossiers/${dossier.id}/ordonnance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        commentaire: 'Test ordonnancement',
        montant: 1000
      })
    })

    if (!ordonnanceResponse.ok) {
      const error = await ordonnanceResponse.json()
      console.error('❌ Erreur ordonnancement:', error)
      return
    }

    console.log('✅ Dossier ordonnançé')

    // 4. Vérifier que le dossier apparaît dans la liste AC
    console.log('\n📊 4. Vérification liste Agent Comptable...')
    const acResponse = await fetch('http://localhost:3000/api/dossiers/ac-pending')
    
    if (!acResponse.ok) {
      const error = await acResponse.json()
      console.error('❌ Erreur récupération dossiers AC:', error)
      return
    }

    const { dossiers } = await acResponse.json()
    const testDossier = dossiers.find(d => d.id === dossier.id)
    
    if (testDossier) {
      console.log('✅ Dossier trouvé dans la liste AC:', testDossier.numeroDossier)
      console.log('✅ Statut:', testDossier.statut)
    } else {
      console.error('❌ Dossier NON trouvé dans la liste AC!')
      console.log('Dossiers disponibles:', dossiers.map(d => ({ id: d.id, numero: d.numeroDossier, statut: d.statut })))
      return
    }

    // 5. Comptabiliser (paiement)
    console.log('\n💳 5. Comptabilisation (paiement)...')
    const paiementResponse = await fetch(`http://localhost:3000/api/dossiers/${dossier.id}/paiement`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: 1000,
        reference: 'REF-TEST-001',
        commentaire: 'Test paiement'
      })
    })

    if (!paiementResponse.ok) {
      const error = await paiementResponse.json()
      console.error('❌ Erreur paiement:', error)
      return
    }

    console.log('✅ Paiement enregistré')

    // 6. Clôturer
    console.log('\n✅ 6. Clôture du dossier...')
    const clotureResponse = await fetch(`http://localhost:3000/api/dossiers/${dossier.id}/cloturer`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentaire: 'Test clôture'
      })
    })

    if (!clotureResponse.ok) {
      const error = await clotureResponse.json()
      console.error('❌ Erreur clôture:', error)
      return
    }

    console.log('✅ Dossier clôturé')

    console.log('\n🎉 TEST RÉUSSI ! Le workflow complet fonctionne via API.')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le test
testWorkflowAPI()
