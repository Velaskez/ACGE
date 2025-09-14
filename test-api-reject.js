const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAPIReject() {
  try {
    console.log('🧪 Test de l\'API de rejet...')
    
    // 1. Récupérer un dossier en attente
    console.log('📋 1. Récupération d\'un dossier en attente...')
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .eq('statut', 'EN_ATTENTE')
      .limit(1)
    
    if (dossiersError || !dossiers || dossiers.length === 0) {
      console.error('❌ Aucun dossier en attente trouvé:', dossiersError)
      return false
    }
    
    const dossier = dossiers[0]
    console.log(`✅ Dossier trouvé: ${dossier.numeroDossier} (Secrétaire: ${dossier.secretaire?.name})`)
    
    // 2. Tester l'API de rejet directement
    console.log('❌ 2. Test de l\'API de rejet...')
    
    const rejectionData = {
      reason: 'Test API - Documents manquants',
      details: 'Test des pièces justificatives manquantes via API.'
    }
    
    // Simuler l'appel API
    const response = await fetch(`http://localhost:3001/api/dossiers/${dossier.id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rejectionData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Erreur API rejet:', errorData)
      return false
    }
    
    const result = await response.json()
    console.log('✅ API rejet réussie:', result.message)
    
    // 3. Vérifier que le dossier a été rejeté
    console.log('📋 3. Vérification du statut du dossier...')
    
    const { data: updatedDossier, error: checkError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('id', dossier.id)
      .single()
    
    if (checkError) {
      console.error('❌ Erreur vérification dossier:', checkError)
      return false
    }
    
    console.log(`✅ Statut du dossier: ${updatedDossier.statut}`)
    console.log(`✅ Motif de rejet: ${updatedDossier.rejectionReason}`)
    
    // 4. Vérifier les notifications
    console.log('🔔 4. Vérification des notifications...')
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', dossier.secretaire.id)
      .order('created_at', { ascending: false })
    
    if (notificationsError) {
      console.error('❌ Erreur récupération notifications:', notificationsError)
      return false
    }
    
    console.log(`✅ ${notifications.length} notifications trouvées`)
    
    // Afficher les notifications récentes
    notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test de l\'API de rejet')
  
  // Attendre que l'application démarre
  console.log('⏳ Attente du démarrage de l\'application...')
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  const success = await testAPIReject()
  
  if (success) {
    console.log('✅ Test de l\'API réussi!')
    console.log('📋 Instructions:')
    console.log('   1. Rafraîchissez la page de l\'interface secrétaire (F5)')
    console.log('   2. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   3. Vous devriez voir la notification de rejet')
  } else {
    console.log('❌ Le test de l\'API a échoué.')
  }
}

main().catch(console.error)
