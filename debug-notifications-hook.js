const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

// Utiliser le client côté client (comme dans le hook)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugNotificationsHook() {
  try {
    console.log('🔍 Debug du hook useNotifications...')
    
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
    
    // 2. Simuler l'authentification (comme dans le hook)
    console.log('🔐 2. Simulation de l\'authentification...')
    
    // Pour le test, on va directement utiliser l'ID de l'utilisateur
    const userId = secretaire.id
    console.log(`✅ User ID: ${userId}`)
    
    // 3. Tester la récupération des notifications (comme dans le hook)
    console.log('🔔 3. Test de récupération des notifications...')
    
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (notificationsError) {
      console.error('❌ Erreur récupération notifications:', notificationsError)
      return false
    }
    
    console.log(`✅ ${notificationsData?.length || 0} notifications récupérées`)
    
    // Afficher les notifications
    notificationsData?.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 4. Tester les statistiques
    console.log('📊 4. Test des statistiques...')
    
    const unreadCount = notificationsData?.filter(n => !n.is_read).length || 0
    const highPriorityCount = notificationsData?.filter(n => !n.is_read && n.priority === 'HIGH').length || 0
    const urgentCount = notificationsData?.filter(n => !n.is_read && n.priority === 'URGENT').length || 0
    
    console.log(`📊 Stats calculées: ${notificationsData?.length || 0} total, ${unreadCount} non lues, ${highPriorityCount} haute priorité, ${urgentCount} urgentes`)
    
    // 5. Tester la fonction RPC
    console.log('⚙️ 5. Test de la fonction RPC...')
    
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_notification_stats', { user_id_param: userId })
    
    if (statsError) {
      console.warn('⚠️ Fonction RPC non disponible:', statsError.message)
    } else {
      console.log('✅ Fonction RPC fonctionne:', statsData[0])
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le debug
async function main() {
  console.log('🎯 Debug du hook useNotifications')
  
  const success = await debugNotificationsHook()
  
  if (success) {
    console.log('✅ Debug réussi! Le hook devrait fonctionner.')
    console.log('📋 Si les notifications n\'apparaissent pas dans la sidebar, le problème est probablement:')
    console.log('   1. L\'utilisateur n\'est pas correctement authentifié')
    console.log('   2. Le hook n\'est pas appelé au bon moment')
    console.log('   3. Il y a une erreur dans le composant sidebar')
  } else {
    console.log('❌ Le debug a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
