require('dotenv').config({ path: '.env' })

async function testOptimizedPrint() {
  try {
    console.log('🧪 Test de la page d\'impression optimisée du quitus...')
    
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
    
    console.log('\n🎯 Instructions pour tester la page d\'impression optimisée:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard dans votre navigateur')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour le dossier DOSS-ACGE-2025875')
    console.log('4. Dans le modal qui s\'ouvre, cliquez sur "Imprimer"')
    console.log('5. Une nouvelle fenêtre s\'ouvrira avec la page d\'impression optimisée')
    console.log('6. Vérifiez que le quitus s\'affiche sans en-têtes/pieds de page du navigateur')
    console.log('7. Vérifiez que le logo ACGE est visible en haut du document')
    
    console.log('\n📋 URL de la page d\'impression:')
    console.log('http://localhost:3000/print-quitus/7faf6305-1fbf-4237-b50c-51e7d16b715d')
    
    console.log('\n✨ Nouvelles améliorations:')
    console.log('- ✅ Suppression des en-têtes et pieds de page du navigateur')
    console.log('- ✅ Marges nulles pour utiliser tout l\'espace A4')
    console.log('- ✅ Logo ACGE ajouté en haut du document')
    console.log('- ✅ Mise en page optimisée avec logo et titre')
    console.log('- ✅ Utilisation maximale de l\'espace disponible')
    
    console.log('\n📄 Structure finale du quitus:')
    console.log('┌─────────────────────────────────────────────────────────┐')
    console.log('│  [LOGO ACGE]    RÉPUBLIQUE GABONAISE                   │')
    console.log('│                MINISTÈRE DE L\'ÉCONOMIE ET DES FINANCES │')
    console.log('│                AGENCE COMPTABLE DES GRANDES ÉCOLES     │')
    console.log('│              QUITUS N° QUITUS-XXX-2025                 │')
    console.log('│            QUITUS DE GESTION COMPTABLE                 │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│              INFORMATIONS DU DOSSIER                   │')
    console.log('│ N° Dossier    Date dépôt    Montant    Poste comptable │')
    console.log('│ Objet: [Description complète]                          │')
    console.log('│ Bénéficiaire                    Nature document         │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│              HISTORIQUE DES VALIDATIONS                │')
    console.log('│ Création par SECRETAIRE    [Date]                      │')
    console.log('│ Validation CB              [Date]                      │')
    console.log('│ Ordonnancement             [Date]                      │')
    console.log('│ Validation Définitive AC   [Date]                      │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│              SYNTHÈSE DES VÉRIFICATIONS                │')
    console.log('│ Type de Vérification    Total  Validés  Rejetés        │')
    console.log('│ Contrôles CB              12      12        0           │')
    console.log('│ Vérifications Ordonnateur  9       9        0           │')
    console.log('├─────────────────────────────────────────────────────────┤')
    console.log('│                      CONCLUSION                        │')
    console.log('│ ✓ DOSSIER CONFORME                                      │')
    console.log('│ [Recommandations]                                       │')
    console.log('│                                                         │')
    console.log('│ Libreville, le [Date]              Agent Comptable     │')
    console.log('│                                     Signature et cachet │')
    console.log('└─────────────────────────────────────────────────────────┘')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

testOptimizedPrint()
