export {}
async function main() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Test de création de dossier...')
  
  try {
    const res = await fetch(`${baseUrl}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: `Test Dossier ${Date.now()}`, 
        description: 'Dossier de test pour vérifier la correction' 
      })
    })
    
    const text = await res.text()
    console.log('📡 Réponse API:', res.status, res.statusText)
    console.log('📄 Contenu:', text)
    
    if (res.ok) {
      console.log('✅ Création de dossier réussie!')
    } else {
      console.log('❌ Échec de la création de dossier')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
