/**
 * 🧪 CRÉATION DOSSIER REJETÉ POUR TEST - ACGE
 * 
 * Script pour créer un dossier rejeté par le CB afin de tester la fonctionnalité de suppression
 */

const createTestRejectedDossier = async () => {
  console.log('🧪 CRÉATION DOSSIER REJETÉ POUR TEST')
  console.log('=' .repeat(50))

  try {
    // 1. Créer un dossier via l'API secrétaire
    console.log('\n📝 1. Création d'un dossier de test...')
    
    const dossierData = {
      objetOperation: 'Test suppression dossier rejeté CB',
      beneficiaire: 'Test Bénéficiaire Suppression',
      posteComptableId: '1', // Assumer que le poste comptable 1 existe
      natureDocumentId: '1', // Assumer que la nature document 1 existe
      dateDepot: new Date().toISOString().split('T')[0]
    }

    const createResponse = await fetch('http://localhost:3000/api/dossiers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(dossierData)
    })

    if (!createResponse.ok) {
      const createError = await createResponse.json()
      throw new Error(`Erreur création dossier: ${createError.error}`)
    }

    const createdDossier = await createResponse.json()
    console.log('✅ Dossier créé:', createdDossier.dossier.numeroDossier)

    // 2. Rejeter le dossier via l'API CB
    console.log('\n❌ 2. Rejet du dossier par le CB...')
    
    const rejectData = {
      rejectionReason: 'Test de suppression',
      rejectionDetails: 'Dossier créé pour tester la fonctionnalité de suppression des dossiers rejetés'
    }

    const rejectResponse = await fetch(`http://localhost:3000/api/dossiers/${createdDossier.dossier.id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(rejectData)
    })

    if (!rejectResponse.ok) {
      const rejectError = await rejectResponse.json()
      throw new Error(`Erreur rejet dossier: ${rejectError.error}`)
    }

    const rejectedDossier = await rejectResponse.json()
    console.log('✅ Dossier rejeté:', rejectedDossier.dossier.numeroDossier)
    console.log('📊 Statut:', rejectedDossier.dossier.statut)

    // 3. Vérifier que le dossier apparaît dans la liste des rejetés
    console.log('\n🔍 3. Vérification dans la liste des dossiers rejetés...')
    
    const rejectedListResponse = await fetch('http://localhost:3000/api/dossiers/cb-rejected', {
      credentials: 'include'
    })

    if (rejectedListResponse.ok) {
      const rejectedListData = await rejectedListResponse.json()
      const testDossier = rejectedListData.dossiers.find(d => d.id === createdDossier.dossier.id)
      
      if (testDossier) {
        console.log('✅ Dossier trouvé dans la liste des rejetés')
        console.log('📋 Détails:', {
          numero: testDossier.numeroDossier,
          objet: testDossier.objetOperation,
          beneficiaire: testDossier.beneficiaire,
          statut: testDossier.statut
        })
      } else {
        console.log('❌ Dossier non trouvé dans la liste des rejetés')
      }
    }

    console.log('\n🎉 DOSSIER REJETÉ CRÉÉ AVEC SUCCÈS')
    console.log('=' .repeat(50))
    console.log('💡 Vous pouvez maintenant tester la suppression via l\'interface CB')

  } catch (error) {
    console.error('❌ ERREUR LORS DE LA CRÉATION:', error.message)
    console.log('=' .repeat(50))
  }
}

// Exécuter le script si appelé directement
if (typeof window === 'undefined') {
  createTestRejectedDossier()
}

module.exports = { createTestRejectedDossier }
