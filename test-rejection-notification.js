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

async function testRejectionNotification() {
  try {
    console.log('🧪 Test de notification de rejet de dossier...')
    
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
    
    // 2. Simuler le rejet via l'API
    console.log('❌ 2. Simulation du rejet via API...')
    
    const rejectionData = {
      reason: 'Test de rejet - Documents manquants',
      details: 'Les pièces justificatives suivantes sont manquantes: facture, devis, et bon de commande.'
    }
    
    // Simuler l'appel API de rejet
    const { data: updatedDossier, error: updateError } = await supabase
      .from('dossiers')
      .update({
        statut: 'REJETÉ_CB',
        rejectionReason: rejectionData.reason,
        rejectionDetails: rejectionData.details,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', dossier.id)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()
    
    if (updateError) {
      console.error('❌ Erreur rejet dossier:', updateError)
      return false
    }
    
    console.log('✅ Dossier rejeté avec succès')
    
    // 3. Créer la notification de rejet
    console.log('🔔 3. Création de la notification de rejet...')
    
    const notificationData = {
      user_id: dossier.secretaire.id,
      title: 'Dossier rejeté par le CB',
      message: `Votre dossier ${dossier.numeroDossier} a été rejeté par le Contrôleur Budgétaire.\n\nMotif: ${rejectionData.reason}\n\nDétails: ${rejectionData.details}\n\nVous pouvez corriger et resoumettre le dossier.`,
      type: 'REJECTION',
      priority: 'HIGH',
      action_url: '/secretaire-rejected',
      action_label: 'Voir les détails',
      metadata: {
        dossierId: dossier.id,
        numeroDossier: dossier.numeroDossier,
        rejectionReason: rejectionData.reason,
        rejectionDetails: rejectionData.details,
        rejectedAt: new Date().toISOString()
      }
    }
    
    const { data: insertedNotification, error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
    
    if (notificationError) {
      console.error('❌ Erreur création notification:', notificationError)
      return false
    }
    
    console.log('✅ Notification de rejet créée:', insertedNotification[0].id)
    
    // 4. Vérifier que la notification est bien visible pour la secrétaire
    console.log('👤 4. Vérification des notifications de la secrétaire...')
    
    const { data: secretaireNotifications, error: secretaireNotificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', dossier.secretaire.id)
      .order('created_at', { ascending: false })
    
    if (secretaireNotificationsError) {
      console.error('❌ Erreur récupération notifications secrétaire:', secretaireNotificationsError)
      return false
    }
    
    console.log(`✅ ${secretaireNotifications.length} notifications trouvées pour la secrétaire`)
    
    // Afficher les notifications
    secretaireNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 5. Vérifier les statistiques
    console.log('📊 5. Vérification des statistiques...')
    
    const unreadCount = secretaireNotifications.filter(n => !n.is_read).length
    const highPriorityCount = secretaireNotifications.filter(n => !n.is_read && n.priority === 'HIGH').length
    const urgentCount = secretaireNotifications.filter(n => !n.is_read && n.priority === 'URGENT').length
    
    console.log(`📊 Stats: ${secretaireNotifications.length} total, ${unreadCount} non lues, ${highPriorityCount} haute priorité, ${urgentCount} urgentes`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test de notification de rejet de dossier')
  
  const success = await testRejectionNotification()
  
  if (success) {
    console.log('✅ Test réussi! La notification de rejet devrait maintenant être visible dans l\'interface secrétaire.')
    console.log('📋 Instructions:')
    console.log('   1. Rafraîchissez la page de l\'interface secrétaire (F5)')
    console.log('   2. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   3. Vous devriez voir la notification de rejet')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
