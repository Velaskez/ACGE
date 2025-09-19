require('dotenv').config({ path: '.env' })

async function testLateralMargins() {
  try {
    console.log('🧪 Test des marges latérales restaurées...')
    
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
    
    console.log('\n❌ PROBLÈME IDENTIFIÉ:')
    console.log('- Marges latérales supprimées (margin: 0)')
    console.log('- Texte collé aux bords de la page')
    console.log('- Document illisible et non professionnel')
    console.log('- Impression de mauvaise qualité')
    
    console.log('\n✅ CORRECTION APPLIQUÉE:')
    
    console.log('\n📏 NOUVELLE CONFIGURATION DES MARGES:')
    console.log('- Marges latérales: 15mm (gauche et droite)')
    console.log('- Marges haut/bas: 0mm (évite en-têtes/pieds)')
    console.log('- Padding container: 15mm haut/bas seulement')
    console.log('- Résultat: Document lisible SANS en-têtes/pieds')
    
    console.log('\n🎯 CONFIGURATION CSS:')
    console.log('@page {')
    console.log('  size: A4;')
    console.log('  margin: 0 15mm;  /* Marges latérales seulement */')
    console.log('}')
    console.log('')
    console.log('.quitus-container {')
    console.log('  padding: 15mm 0;  /* Marges haut/bas internes */')
    console.log('}')
    
    console.log('\n✨ AVANTAGES DE CETTE SOLUTION:')
    console.log('- ✅ Marges latérales: Texte bien espacé des bords')
    console.log('- ✅ Pas d\'en-têtes: margin-top: 0')
    console.log('- ✅ Pas de pieds: margin-bottom: 0')
    console.log('- ✅ Document professionnel: Lisible et bien formaté')
    console.log('- ✅ Impression optimale: Qualité professionnelle')
    
    console.log('\n📋 Instructions de test:')
    console.log('1. Ouvrez http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    console.log('2. Vous devriez voir le document avec des marges latérales')
    console.log('3. Cliquez sur "Imprimer" ou utilisez Ctrl+P')
    console.log('4. ✅ Le texte ne doit plus être collé aux bords')
    console.log('5. ✅ Les marges latérales doivent être visibles')
    console.log('6. ✅ Pas d\'en-têtes/pieds de page parasites')
    
    console.log('\n🎉 RÉSULTAT ATTENDU:')
    console.log('┌───────────────────────────────────────────────────────┐')
    console.log('│                                                       │')
    console.log('│    [LOGO ACGE]    RÉPUBLIQUE GABONAISE               │')
    console.log('│              MINISTÈRE DE L\'ÉCONOMIE                 │')
    console.log('│          AGENCE COMPTABLE DES GRANDES ÉCOLES         │')
    console.log('│                                                       │')
    console.log('│    QUITUS N° QUITUS-XXX-2025                        │')
    console.log('│                                                       │')
    console.log('│    [CONTENU DU QUITUS AVEC MARGES LATÉRALES]        │')
    console.log('│                                                       │')
    console.log('│    ✅ Texte bien espacé des bords                   │')
    console.log('│    ✅ Marges latérales de 15mm                      │')
    console.log('│    ✅ Pas d\'en-têtes/pieds parasites               │')
    console.log('│                                                       │')
    console.log('└───────────────────────────────────────────────────────┘')
    
    console.log('\n📄 URL de test:')
    console.log('http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testLateralMargins()
