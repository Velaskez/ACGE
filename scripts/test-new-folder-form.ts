export {}
async function main() {
  const baseUrl = 'http://localhost:3001'
  
  console.log('🧪 Test des nouvelles APIs pour le formulaire de dossier...\n')
  
  try {
    // Test API postes comptables
    console.log('📊 Test API postes comptables...')
    const postesRes = await fetch(`${baseUrl}/api/postes-comptables`)
    const postesData = await postesRes.json()
    console.log('📡 Réponse postes comptables:', postesRes.status, postesRes.statusText)
    console.log('📄 Données:', postesData.postesComptables?.length || 0, 'postes comptables')
    
    // Test API natures documents
    console.log('\n📄 Test API natures documents...')
    const naturesRes = await fetch(`${baseUrl}/api/natures-documents`)
    const naturesData = await naturesRes.json()
    console.log('📡 Réponse natures documents:', naturesRes.status, naturesRes.statusText)
    console.log('📄 Données:', naturesData.naturesDocuments?.length || 0, 'natures de documents')
    
    // Test création dossier avec nouveaux champs
    console.log('\n📁 Test création dossier avec nouveaux champs...')
    const dossierRes = await fetch(`${baseUrl}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Dossier Comptable',
        description: 'Dossier de test avec tous les champs',
        numeroDossier: 'DOSS-ACGE-2025001',
        dateDepot: '2025-01-20',
        posteComptableId: postesData.postesComptables?.[0]?.id,
        numeroNature: '01',
        natureDocumentId: naturesData.naturesDocuments?.[0]?.id,
        objetOperation: 'Test objet opération',
        beneficiaire: 'Test bénéficiaire'
      })
    })
    
    const dossierData = await dossierRes.text()
    console.log('📡 Réponse création dossier:', dossierRes.status, dossierRes.statusText)
    console.log('📄 Contenu:', dossierData)
    
    if (postesRes.ok && naturesRes.ok && dossierRes.ok) {
      console.log('\n✅ Tous les tests sont passés!')
    } else {
      console.log('\n❌ Certains tests ont échoué')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

