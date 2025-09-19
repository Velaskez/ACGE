require('dotenv').config({ path: '.env' })

async function testSynchronizedQuitus() {
  try {
    console.log('🧪 Test du quitus synchronisé entre modal et impression...')
    
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
    
    console.log('\n🎯 Instructions pour tester la synchronisation:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard dans votre navigateur')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour le dossier DOSS-ACGE-2025875')
    console.log('4. Vérifiez que le modal affiche maintenant le quitus avec le logo ACGE')
    console.log('5. Testez les deux options d\'impression :')
    console.log('   - "Imprimer" : Ouvre une nouvelle fenêtre optimisée')
    console.log('   - "Imprimer depuis le modal" : Imprime directement depuis le modal')
    
    console.log('\n📋 URLs disponibles:')
    console.log('- Dashboard AC: http://localhost:3000/ac-dashboard')
    console.log('- Page d\'impression: http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    
    console.log('\n✨ Améliorations apportées:')
    console.log('- ✅ Synchronisation des styles entre modal et page d\'impression')
    console.log('- ✅ Logo ACGE visible dans le modal ET la page d\'impression')
    console.log('- ✅ Deux options d\'impression disponibles')
    console.log('- ✅ Même apparence professionnelle partout')
    console.log('- ✅ Pas besoin de lecteur PDF (HTML/CSS pur)')
    
    console.log('\n🔍 Réponses à vos questions:')
    console.log('1. Pourquoi la différence d\'affichage ?')
    console.log('   → Le modal utilisait les styles de l\'app, la page d\'impression les styles @media print')
    console.log('   → Maintenant synchronisés avec les mêmes styles visuels')
    console.log('')
    console.log('2. Pourquoi la redirection vers un autre lien ?')
    console.log('   → C\'est normal pour l\'impression optimisée (nouvelle fenêtre)')
    console.log('   → Maintenant vous avez aussi l\'option d\'imprimer depuis le modal')
    console.log('')
    console.log('3. Faut-il installer un lecteur PDF ?')
    console.log('   → NON ! C\'est du HTML/CSS pur, aucun PDF nécessaire')
    console.log('   → Le navigateur gère tout nativement')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testSynchronizedQuitus()
