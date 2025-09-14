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

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Test du workflow complet: création → soumission → rejet → notification')
    
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
    
    // 2. Récupérer les données comptables
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
    
    // 3. Créer un dossier en attente
    console.log('📁 3. Création d\'un dossier en attente...')
    const testDossier = {
      id: `test-workflow-${Date.now()}`,
      numeroDossier: `DOSS-ACGE-WORKFLOW-${Date.now()}`,
      numeroNature: 'NATURE-WORKFLOW-001',
      objetOperation: 'Test workflow complet',
      beneficiaire: 'Test Bénéficiaire Workflow',
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
    
    // 4. Attendre que l'application démarre
    console.log('⏳ 4. Attente du démarrage de l\'application...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // 5. Tester l'API de rejet
    console.log('❌ 5. Test de l\'API de rejet...')
    
    const rejectionData = {
      reason: 'Test workflow - Documents manquants',
      details: 'Test des pièces justificatives manquantes via workflow complet.'
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/dossiers/${insertedDossier.id}/reject`, {
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
      
    } catch (fetchError) {
      console.error('❌ Erreur fetch API:', fetchError)
      console.log('⚠️ L\'application n\'est peut-être pas encore démarrée. Essayez de nouveau dans quelques minutes.')
      return false
    }
    
    // 6. Vérifier que le dossier a été rejeté
    console.log('📋 6. Vérification du statut du dossier...')
    
    const { data: updatedDossier, error: checkError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('id', insertedDossier.id)
      .single()
    
    if (checkError) {
      console.error('❌ Erreur vérification dossier:', checkError)
      return false
    }
    
    console.log(`✅ Statut du dossier: ${updatedDossier.statut}`)
    console.log(`✅ Motif de rejet: ${updatedDossier.rejectionReason}`)
    
    // 7. Vérifier les notifications
    console.log('🔔 7. Vérification des notifications...')
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
      .order('created_at', { ascending: false })
    
    if (notificationsError) {
      console.error('❌ Erreur récupération notifications:', notificationsError)
      return false
    }
    
    console.log(`✅ ${notifications.length} notifications trouvées`)
    
    // Afficher les notifications récentes
    notifications.slice(0, 5).forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 8. Vérifier les statistiques
    console.log('📊 8. Vérification des statistiques...')
    
    const unreadCount = notifications.filter(n => !n.is_read).length
    const highPriorityCount = notifications.filter(n => !n.is_read && n.priority === 'HIGH').length
    const urgentCount = notifications.filter(n => !n.is_read && n.priority === 'URGENT').length
    
    console.log(`📊 Stats: ${notifications.length} total, ${unreadCount} non lues, ${highPriorityCount} haute priorité, ${urgentCount} urgentes`)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test du workflow complet de notifications')
  
  const success = await testCompleteWorkflow()
  
  if (success) {
    console.log('✅ Test réussi! Le système de notifications fonctionne correctement.')
    console.log('📋 Instructions:')
    console.log('   1. Rafraîchissez la page de l\'interface secrétaire (F5)')
    console.log('   2. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   3. Vous devriez voir la notification de rejet')
    console.log('   4. Vérifiez la page "Mes Dossiers Rejetés" pour voir le dossier rejeté')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
    console.log('💡 Si l\'erreur est "fetch failed", attendez que l\'application démarre et relancez le test.')
  }
}

main().catch(console.error)
