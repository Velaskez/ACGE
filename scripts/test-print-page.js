require('dotenv').config({ path: '.env' })

async function testPrintPage() {
  try {
    console.log('🧪 Test de la page d\'impression du quitus...')
    
    // Test de génération de quitus
    const response = await fetch('http://localhost:3000/api/dossiers/7faf6305-1fbf-4237-b50c-51e7d16b715d/generate-quitus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Quitus généré avec succès')
    console.log('📄 Numéro:', data.quitus.numeroQuitus)
    
    console.log('\n🎯 Instructions pour tester la nouvelle page d\'impression:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard dans votre navigateur')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour le dossier DOSS-ACGE-2025875')
    console.log('4. Dans le modal qui s\'ouvre, cliquez sur "Imprimer"')
    console.log('5. Une nouvelle fenêtre s\'ouvrira avec la page d\'impression dédiée')
    console.log('6. Le quitus s\'affichera automatiquement et l\'impression se lancera')
    console.log('7. Vérifiez que le quitus ressemble maintenant à un document officiel')
    
    console.log('\n📋 URL de la page d\'impression:')
    console.log('http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    
    console.log('\n✨ Avantages de la nouvelle approche:')
    console.log('- ✅ Page dédiée à l\'impression (pas de modal)')
    console.log('- ✅ Styles d\'impression optimisés')
    console.log('- ✅ Auto-impression au chargement')
    console.log('- ✅ Affichage comme document officiel')
    console.log('- ✅ Format A4 parfait')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testPrintPage()
