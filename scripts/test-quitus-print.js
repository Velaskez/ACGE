require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const admin = createClient(supabaseUrl, supabaseServiceKey)

async function testQuitusPrint() {
  try {
    console.log('🧪 Test de génération de quitus pour impression...')
    
    // Générer un quitus
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
    console.log('📅 Date:', data.quitus.dateGeneration)
    console.log('📋 Dossier:', data.quitus.dossier.numero)
    console.log('💰 Montant:', data.quitus.dossier.montantOrdonnance, 'XAF')
    
    console.log('\n🎯 Instructions pour tester l\'impression:')
    console.log('1. Ouvrez http://localhost:3000/ac-dashboard dans votre navigateur')
    console.log('2. Connectez-vous avec un compte Agent Comptable')
    console.log('3. Cliquez sur "Générer quitus" pour le dossier DOSS-ACGE-2025875')
    console.log('4. Dans le modal qui s\'ouvre, cliquez sur "Imprimer"')
    console.log('5. Vérifiez que le quitus s\'affiche comme un document officiel')
    console.log('6. Le quitus doit tenir sur une seule page A4')
    
    console.log('\n📋 Structure attendue du quitus imprimé:')
    console.log('┌─────────────────────────────────────────────────────────┐')
    console.log('│                RÉPUBLIQUE GABONAISE                     │')
    console.log('│         MINISTÈRE DE L\'ÉCONOMIE ET DES FINANCES        │')
    console.log('│         AGENCE COMPTABLE DES GRANDES ÉCOLES            │')
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

testQuitusPrint()
