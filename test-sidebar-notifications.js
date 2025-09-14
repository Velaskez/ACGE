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

async function testSidebarNotifications() {
  try {
    console.log('🧪 Test des notifications dans la sidebar...')
    
    // 1. Vérifier les notifications en base
    console.log('📋 1. Vérification des notifications en base...')
    
    const { data: allNotifications, error: allError } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (allError) {
      console.error('❌ Erreur récupération toutes notifications:', allError)
      return false
    }
    
    console.log(`✅ ${allNotifications.length} notifications totales en base`)
    
    // Afficher toutes les notifications
    allNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - User: ${notif.user_id} - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 2. Récupérer un utilisateur secrétaire
    console.log('👤 2. Récupération d\'un utilisateur secrétaire...')
    
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
    console.log(`✅ Secrétaire: ${secretaire.name} (${secretaire.email}) - ID: ${secretaire.id}`)
    
    // 3. Vérifier les notifications de cette secrétaire
    console.log('🔔 3. Vérification des notifications de la secrétaire...')
    
    const { data: secretaireNotifications, error: secretaireError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
      .order('created_at', { ascending: false })
    
    if (secretaireError) {
      console.error('❌ Erreur récupération notifications secrétaire:', secretaireError)
      return false
    }
    
    console.log(`✅ ${secretaireNotifications.length} notifications pour la secrétaire`)
    
    // Afficher les notifications de la secrétaire
    secretaireNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 4. Vérifier les statistiques
    console.log('📊 4. Vérification des statistiques...')
    
    const unreadCount = secretaireNotifications.filter(n => !n.is_read).length
    const highPriorityCount = secretaireNotifications.filter(n => !n.is_read && n.priority === 'HIGH').length
    const urgentCount = secretaireNotifications.filter(n => !n.is_read && n.priority === 'URGENT').length
    
    console.log(`📊 Stats: ${secretaireNotifications.length} total, ${unreadCount} non lues, ${highPriorityCount} haute priorité, ${urgentCount} urgentes`)
    
    // 5. Créer une notification de test pour la sidebar
    console.log('🔔 5. Création d\'une notification de test pour la sidebar...')
    
    const testNotification = {
      user_id: secretaire.id,
      title: 'Test Sidebar - Notification visible',
      message: 'Cette notification devrait être visible dans la sidebar de l\'interface secrétaire.',
      type: 'INFO',
      priority: 'MEDIUM',
      action_url: '/secretaire-dashboard',
      action_label: 'Voir le dashboard'
    }
    
    const { data: insertedNotification, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur création notification test:', insertError)
      return false
    }
    
    console.log('✅ Notification de test créée:', insertedNotification[0].id)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test des notifications dans la sidebar')
  
  const success = await testSidebarNotifications()
  
  if (success) {
    console.log('🎉 Test réussi!')
    console.log('📋 Instructions:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Ouvrez la console du navigateur (F12)')
    console.log('   3. Regardez les logs qui commencent par "🔍 useNotifications:"')
    console.log('   4. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   5. Vous devriez voir la notification "Test Sidebar - Notification visible"')
    console.log('')
    console.log('🔍 Si les notifications n\'apparaissent pas, vérifiez les logs de la console pour voir les erreurs.')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
