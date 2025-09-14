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

async function createTestDossierAndReject() {
  try {
    console.log('🧪 Création d\'un dossier de test et test de rejet...')
    
    // 1. Récupérer un utilisateur secrétaire
    console.log('👤 1. Récupération d\'un utilisateur secrétaire...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'SECRETAIRE')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur secrétaire trouvé:', usersError)
      return false
    }
    
    const secretaire = users[0]
    console.log(`✅ Secrétaire: ${secretaire.name} (${secretaire.email})`)
    
    // 2. Récupérer un poste comptable et une nature de document
    console.log('📊 2. Récupération des données comptables...')
    const { data: postesComptables, error: postesError } = await supabase
      .from('postes_comptables')
      .select('id, numero, intitule')
      .limit(1)
    
    const { data: natureDocuments, error: natureError } = await supabase
      .from('natures_documents')
      .select('id, numero, nom')
      .limit(1)
    
    if (postesError || !postesComptables || postesComptables.length === 0) {
      console.error('❌ Aucun poste comptable trouvé:', postesError)
      return false
    }
    
    if (natureError || !natureDocuments || natureDocuments.length === 0) {
      console.error('❌ Aucune nature de document trouvée:', natureError)
      return false
    }
    
    const posteComptable = postesComptables[0]
    const natureDocument = natureDocuments[0]
    
    console.log(`✅ Poste comptable: ${posteComptable.numero} - ${posteComptable.intitule}`)
    console.log(`✅ Nature document: ${natureDocument.numero} - ${natureDocument.nom}`)
    
    // 3. Créer un dossier de test
    console.log('📁 3. Création d\'un dossier de test...')
    const testDossier = {
      id: `test-dossier-${Date.now()}`,
      numeroDossier: `DOSS-ACGE-TEST-${Date.now()}`,
      numeroNature: 'NATURE-TEST-001',
      objetOperation: 'Test de notification de rejet',
      beneficiaire: 'Test Bénéficiaire',
      posteComptableId: posteComptable.id,
      natureDocumentId: natureDocument.id,
      secretaireId: secretaire.id,
      statut: 'EN_ATTENTE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const { data: insertedDossier, error: insertError } = await supabase
      .from('dossiers')
      .insert(testDossier)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()
    
    if (insertError) {
      console.error('❌ Erreur création dossier:', insertError)
      return false
    }
    
    console.log(`✅ Dossier créé: ${insertedDossier.numeroDossier}`)
    
    // 4. Simuler le rejet du dossier
    console.log('❌ 4. Simulation du rejet du dossier...')
    
    const rejectionData = {
      reason: 'Test de rejet - Documents manquants',
      details: 'Les pièces justificatives suivantes sont manquantes: facture, devis, et bon de commande.'
    }
    
    const { data: rejectedDossier, error: rejectError } = await supabase
      .from('dossiers')
      .update({
        statut: 'REJETÉ_CB',
        rejectionReason: rejectionData.reason,
        rejectionDetails: rejectionData.details,
        rejectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', insertedDossier.id)
      .select(`
        *,
        poste_comptable:posteComptableId(*),
        nature_document:natureDocumentId(*),
        secretaire:secretaireId(id, name, email)
      `)
      .single()
    
    if (rejectError) {
      console.error('❌ Erreur rejet dossier:', rejectError)
      return false
    }
    
    console.log('✅ Dossier rejeté avec succès')
    
    // 5. Créer la notification de rejet
    console.log('🔔 5. Création de la notification de rejet...')
    
    const notificationData = {
      user_id: secretaire.id,
      title: 'Dossier rejeté par le CB',
      message: `Votre dossier ${rejectedDossier.numeroDossier} a été rejeté par le Contrôleur Budgétaire.\n\nMotif: ${rejectionData.reason}\n\nDétails: ${rejectionData.details}\n\nVous pouvez corriger et resoumettre le dossier.`,
      type: 'REJECTION',
      priority: 'HIGH',
      action_url: '/secretaire-rejected',
      action_label: 'Voir les détails',
      metadata: {
        dossierId: rejectedDossier.id,
        numeroDossier: rejectedDossier.numeroDossier,
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
    
    // 6. Vérifier les notifications de la secrétaire
    console.log('👤 6. Vérification des notifications de la secrétaire...')
    
    const { data: secretaireNotifications, error: secretaireNotificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
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
    
    // 7. Vérifier les statistiques
    console.log('📊 7. Vérification des statistiques...')
    
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
  console.log('🎯 Test complet: création dossier + rejet + notification')
  
  const success = await createTestDossierAndReject()
  
  if (success) {
    console.log('✅ Test réussi!')
    console.log('📋 Instructions:')
    console.log('   1. Rafraîchissez la page de l\'interface secrétaire (F5)')
    console.log('   2. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   3. Vous devriez voir la notification de rejet')
    console.log('   4. Vérifiez la page "Mes Dossiers Rejetés" pour voir le dossier rejeté')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
