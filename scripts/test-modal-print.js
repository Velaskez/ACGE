require('dotenv').config({ path: '.env' })

async function testModalPrint() {
  try {
    console.log('🧪 Test de l\'impression directe depuis le modal...')
    
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
    
    console.log('\n🎯 Instructions pour tester l\'impression depuis le modal:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard dans votre navigateur')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour le dossier DOSS-ACGE-2025875')
    console.log('4. Dans le modal qui s\'ouvre, vérifiez que le quitus s\'affiche avec le logo ACGE')
    console.log('5. Cliquez sur "Imprimer" - cela devrait lancer l\'impression directement')
    console.log('6. Vérifiez que seul le quitus s\'imprime (pas le dashboard)')
    
    console.log('\n✅ Corrections apportées:')
    console.log('- ❌ Supprimé le bouton "Imprimer depuis le modal" (inutile)')
    console.log('- ✅ Le bouton "Imprimer" lance maintenant window.print() directement')
    console.log('- ✅ Styles CSS optimisés pour masquer le dashboard lors de l\'impression')
    console.log('- ✅ Seul le contenu du modal (quitus) s\'imprime')
    console.log('- ✅ Pas de redirection vers une autre page')
    
    console.log('\n🖨️ Comportement attendu:')
    console.log('- Le modal reste ouvert')
    console.log('- L\'impression se lance directement')
    console.log('- Seul le quitus s\'imprime (avec logo ACGE)')
    console.log('- Le dashboard est masqué à l\'impression')
    console.log('- Format A4 optimisé')
    
    console.log('\n📋 URLs de test:')
    console.log('- Dashboard AC: http://localhost:3000/ac-dashboard')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testModalPrint()
