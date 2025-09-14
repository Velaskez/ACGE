#!/usr/bin/env node

/**
 * Script pour vérifier les postes comptables via l'API
 */

async function checkViaAPI() {
  console.log('🔍 Vérification via l\'API...\n')

  try {
    // 1. Vérifier les postes comptables disponibles
    console.log('1. Postes comptables disponibles:')
    const postesResponse = await fetch('http://localhost:3000/api/postes-comptables')
    if (postesResponse.ok) {
      const postesData = await postesResponse.json()
      console.log(`✅ ${postesData.postesComptables?.length || 0} postes comptables trouvés:`)
      postesData.postesComptables?.forEach((poste, index) => {
        console.log(`   ${index + 1}. ${poste.numero} - ${poste.intitule} (ID: ${poste.id})`)
      })
    } else {
      console.error('❌ Erreur API postes comptables:', postesResponse.status)
    }

    // 2. Vérifier les dossiers en attente
    console.log('\n2. Dossiers en attente:')
    const dossiersResponse = await fetch('http://localhost:3000/api/dossiers/cb-pending')
    if (dossiersResponse.ok) {
      const dossiersData = await dossiersResponse.json()
      console.log(`✅ ${dossiersData.dossiers?.length || 0} dossiers en attente:`)
      dossiersData.dossiers?.forEach((dossier, index) => {
        console.log(`   ${index + 1}. ${dossier.numeroDossier}`)
        console.log(`      Poste Comptable ID: ${dossier.posteComptableId}`)
        console.log(`      Poste Comptable: ${dossier.poste_comptable?.numero || 'N/A'} - ${dossier.poste_comptable?.intitule || 'N/A'}`)
        console.log(`      Statut: ${dossier.statut}`)
        console.log(`      Créé: ${dossier.createdAt}`)
        console.log('')
      })
    } else {
      console.error('❌ Erreur API dossiers:', dossiersResponse.status)
    }

    // 3. Vérifier tous les dossiers
    console.log('\n3. Tous les dossiers:')
    const allDossiersResponse = await fetch('http://localhost:3000/api/dossiers')
    if (allDossiersResponse.ok) {
      const allDossiersData = await allDossiersResponse.json()
      console.log(`✅ ${allDossiersData.dossiers?.length || 0} dossiers trouvés:`)
      allDossiersData.dossiers?.forEach((dossier, index) => {
        console.log(`   ${index + 1}. ${dossier.numeroDossier}`)
        console.log(`      Poste Comptable ID: ${dossier.posteComptableId}`)
        console.log(`      Poste Comptable: ${dossier.poste_comptable?.numero || 'N/A'} - ${dossier.poste_comptable?.intitule || 'N/A'}`)
        console.log(`      Statut: ${dossier.statut}`)
        console.log(`      Créé: ${dossier.createdAt}`)
        console.log('')
      })
    } else {
      console.error('❌ Erreur API tous dossiers:', allDossiersResponse.status)
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

// Exécuter la vérification
checkViaAPI()
  .then(() => {
    console.log('\n✅ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
