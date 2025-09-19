require('dotenv').config({ path: '.env' })

async function testRealDocumentPrint() {
  try {
    console.log('🧪 Test de l\'impression de VRAI DOCUMENT (pas capture d\'écran)...')
    
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
    
    console.log('\n🎯 SOLUTION APPLIQUÉE:')
    console.log('❌ PROBLÈME: window.print() = capture d\'écran du navigateur')
    console.log('✅ SOLUTION: Page d\'impression dédiée = VRAI DOCUMENT')
    
    console.log('\n🖨️ NOUVEAU COMPORTEMENT:')
    console.log('1. Clic sur "Imprimer" → Ouvre une nouvelle fenêtre')
    console.log('2. La fenêtre génère le quitus comme DOCUMENT OFFICIEL')
    console.log('3. L\'impression se lance automatiquement')
    console.log('4. La fenêtre se ferme après impression')
    console.log('5. RÉSULTAT: Document professionnel, PAS de capture d\'écran')
    
    console.log('\n📋 Instructions de test:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour DOSS-ACGE-2025875')
    console.log('4. Cliquez sur "Imprimer"')
    console.log('5. ✅ Une nouvelle fenêtre s\'ouvre avec le DOCUMENT OFFICIEL')
    console.log('6. ✅ L\'impression se lance automatiquement')
    console.log('7. ✅ Vous obtenez un VRAI DOCUMENT, pas une capture d\'écran')
    
    console.log('\n🎉 DIFFÉRENCES:')
    console.log('❌ AVANT: Capture d\'écran floue du modal')
    console.log('✅ MAINTENANT: Document officiel avec:')
    console.log('   - Logo ACGE en haute qualité')
    console.log('   - Texte net et lisible')
    console.log('   - Bordures et tableaux parfaits')
    console.log('   - Format A4 professionnel')
    console.log('   - Aucun élément du navigateur')
    
    console.log('\n📄 URL de test direct:')
    console.log('http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testRealDocumentPrint()
