/**
 * 🧪 TEST COMPLET WORKFLOW SUPPRESSION CB - ACGE
 * 
 * Script de test complet pour la fonctionnalité de suppression des dossiers rejetés
 * par le Contrôleur Budgétaire
 */

const testCompleteCBDeleteWorkflow = async () => {
  console.log('🧪 TEST COMPLET - Workflow Suppression Dossiers Rejetés CB')
  console.log('=' .repeat(70))

  let createdDossierId = null

  try {
    // ÉTAPE 1: Créer un dossier de test
    console.log('\n📝 ÉTAPE 1: Création d'un dossier de test...')
    
    const dossierData = {
      objetOperation: 'Test suppression CB - ' + new Date().toISOString(),
      beneficiaire: 'Test Bénéficiaire Suppression CB',
      posteComptableId: '1',
      natureDocumentId: '1',
      dateDepot: new Date().toISOString().split('T')[0]
    }

    const createResponse = await fetch('http://localhost:3000/api/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dossierData)
    })

    if (!createResponse.ok) {
      const createError = await createResponse.json()
      throw new Error(`Erreur création dossier: ${createError.error}`)
    }

    const createdDossier = await createResponse.json()
    createdDossierId = createdDossier.dossier.id
    console.log('✅ Dossier créé:', createdDossier.dossier.numeroDossier)

    // ÉTAPE 2: Rejeter le dossier
    console.log('\n❌ ÉTAPE 2: Rejet du dossier par le CB...')
    
    const rejectData = {
      rejectionReason: 'Test suppression CB',
      rejectionDetails: 'Dossier créé pour tester la suppression des dossiers rejetés'
    }

    const rejectResponse = await fetch(`http://localhost:3000/api/dossiers/${createdDossierId}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(rejectData)
    })

    if (!rejectResponse.ok) {
      const rejectError = await rejectResponse.json()
      throw new Error(`Erreur rejet dossier: ${rejectError.error}`)
    }

    const rejectedDossier = await rejectResponse.json()
    console.log('✅ Dossier rejeté:', rejectedDossier.dossier.numeroDossier)

    // ÉTAPE 3: Vérifier que le dossier est dans la liste des rejetés
    console.log('\n🔍 ÉTAPE 3: Vérification dans la liste des rejetés...')
    
    const rejectedListResponse = await fetch('http://localhost:3000/api/dossiers/cb-rejected', {
      credentials: 'include'
    })

    if (!rejectedListResponse.ok) {
      throw new Error('Erreur récupération liste rejetés')
    }

    const rejectedListData = await rejectedListResponse.json()
    const testDossier = rejectedListData.dossiers.find(d => d.id === createdDossierId)
    
    if (!testDossier) {
      throw new Error('Dossier non trouvé dans la liste des rejetés')
    }
    
    console.log('✅ Dossier confirmé dans la liste des rejetés')

    // ÉTAPE 4: Tester la suppression via l'API CB
    console.log('\n🗑️ ÉTAPE 4: Test de suppression via API CB...')
    
    const deleteResponse = await fetch(`http://localhost:3000/api/dossiers/cb-rejected/${createdDossierId}/delete`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!deleteResponse.ok) {
      const deleteError = await deleteResponse.json()
      throw new Error(`Erreur suppression: ${deleteError.error}`)
    }

    const deleteData = await deleteResponse.json()
    console.log('✅ Suppression réussie:', deleteData.message)
    console.log('📊 Dossier supprimé:', deleteData.deletedDossier)

    // ÉTAPE 5: Vérifier que le dossier a été supprimé
    console.log('\n🔍 ÉTAPE 5: Vérification de la suppression...')
    
    const verifyResponse = await fetch('http://localhost:3000/api/dossiers/cb-rejected', {
      credentials: 'include'
    })

    if (!verifyResponse.ok) {
      throw new Error('Erreur vérification suppression')
    }

    const verifyData = await verifyResponse.json()
    const stillExists = verifyData.dossiers.find(d => d.id === createdDossierId)
    
    if (stillExists) {
      throw new Error('Le dossier existe encore après suppression')
    }
    
    console.log('✅ Dossier confirmé supprimé de la liste des rejetés')

    // ÉTAPE 6: Tester la suppression d'un dossier inexistant
    console.log('\n🧪 ÉTAPE 6: Test suppression dossier inexistant...')
    
    const fakeId = '00000000-0000-0000-0000-000000000000'
    const fakeDeleteResponse = await fetch(`http://localhost:3000/api/dossiers/cb-rejected/${fakeId}/delete`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (fakeDeleteResponse.status === 404) {
      console.log('✅ Gestion correcte du dossier inexistant (404)')
    } else {
      console.log('⚠️ Réponse inattendue pour dossier inexistant:', fakeDeleteResponse.status)
    }

    console.log('\n🎉 TEST COMPLET RÉUSSI !')
    console.log('=' .repeat(70))
    console.log('✅ Toutes les fonctionnalités de suppression CB fonctionnent correctement')

  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST COMPLET:', error.message)
    console.log('=' .repeat(70))
    
    // Nettoyage en cas d'erreur
    if (createdDossierId) {
      console.log('\n🧹 Tentative de nettoyage...')
      try {
        await fetch(`http://localhost:3000/api/dossiers/cb-rejected/${createdDossierId}/delete`, {
          method: 'DELETE',
          credentials: 'include'
        })
        console.log('✅ Nettoyage effectué')
      } catch (cleanupError) {
        console.log('⚠️ Erreur lors du nettoyage:', cleanupError.message)
      }
    }
  }
}

// Exécuter le test si le script est appelé directement
if (typeof window === 'undefined') {
  testCompleteCBDeleteWorkflow()
}

module.exports = { testCompleteCBDeleteWorkflow }
