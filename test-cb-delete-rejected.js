/**
 * 🧪 TEST SUPPRESSION DOSSIERS REJETÉS CB - ACGE
 * 
 * Script de test pour vérifier la fonctionnalité de suppression des dossiers rejetés
 * par le Contrôleur Budgétaire
 */

const testCBDeleteRejected = async () => {
  console.log('🧪 DÉBUT DU TEST - Suppression dossiers rejetés CB')
  console.log('=' .repeat(60))

  try {
    // 1. Récupérer les dossiers rejetés existants
    console.log('\n📊 1. Récupération des dossiers rejetés CB...')
    const rejectedResponse = await fetch('http://localhost:3000/api/dossiers/cb-rejected', {
      credentials: 'include'
    })

    if (!rejectedResponse.ok) {
      throw new Error(`Erreur récupération dossiers rejetés: ${rejectedResponse.status}`)
    }

    const rejectedData = await rejectedResponse.json()
    console.log(`✅ ${rejectedData.dossiers?.length || 0} dossiers rejetés trouvés`)

    if (rejectedData.dossiers && rejectedData.dossiers.length > 0) {
      const firstDossier = rejectedData.dossiers[0]
      console.log(`📋 Premier dossier rejeté: ${firstDossier.numeroDossier}`)
      console.log(`   - Objet: ${firstDossier.objetOperation}`)
      console.log(`   - Bénéficiaire: ${firstDossier.beneficiaire}`)
      console.log(`   - Statut: ${firstDossier.statut}`)

      // 2. Tester la suppression d'un dossier rejeté
      console.log('\n🗑️ 2. Test de suppression du premier dossier rejeté...')
      const deleteResponse = await fetch(`http://localhost:3000/api/dossiers/cb-rejected/${firstDossier.id}/delete`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (deleteResponse.ok) {
        const deleteData = await deleteResponse.json()
        console.log('✅ Suppression réussie:', deleteData.message)
        console.log('📊 Dossier supprimé:', deleteData.deletedDossier)
      } else {
        const deleteError = await deleteResponse.json()
        console.log('❌ Erreur suppression:', deleteError.error)
      }
    } else {
      console.log('ℹ️ Aucun dossier rejeté trouvé pour le test')
    }

    // 3. Vérifier que le dossier a bien été supprimé
    console.log('\n🔍 3. Vérification de la suppression...')
    const verifyResponse = await fetch('http://localhost:3000/api/dossiers/cb-rejected', {
      credentials: 'include'
    })

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json()
      console.log(`✅ ${verifyData.dossiers?.length || 0} dossiers rejetés restants`)
    }

    console.log('\n🎉 TEST TERMINÉ - Suppression dossiers rejetés CB')
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ ERREUR LORS DU TEST:', error.message)
    console.log('=' .repeat(60))
  }
}

// Exécuter le test si le script est appelé directement
if (typeof window === 'undefined') {
  testCBDeleteRejected()
}

module.exports = { testCBDeleteRejected }
