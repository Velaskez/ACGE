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

async function testFinalNotifications() {
  try {
    console.log('🧪 Test final du système de notifications...')
    
    // 1. Récupérer un utilisateur secrétaire
    console.log('👤 1. Récupération d\'un utilisateur secrétaire...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'SECRETAIRE')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur secrétaire trouvé:', usersError)
      return false
    }
    
    const secretaire = users[0]
    console.log(`✅ Secrétaire: ${secretaire.name} (${secretaire.email}) - ID: ${secretaire.id}`)
    
    // 2. Vérifier les notifications en base
    console.log('📊 2. Vérification des notifications en base...')
    
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notificationsError) {
      console.error('❌ Erreur récupération notifications:', notificationsError)
      return false
    }
    
    console.log(`✅ ${notifications.length} notifications trouvées en base`)
    
    // Afficher les notifications
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    // 3. Créer une notification de test finale
    console.log('🔔 3. Création d\'une notification de test finale...')
    
    const testNotification = {
      user_id: secretaire.id,
      title: 'Test Final - Notifications opérationnelles',
      message: 'Le système de notifications est maintenant pleinement opérationnel ! Vous devriez voir cette notification dans la sidebar.',
      type: 'SUCCESS',
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
    
    console.log('✅ Notification de test finale créée:', insertedNotification[0].id)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test final du système de notifications')
  
  const success = await testFinalNotifications()
  
  if (success) {
    console.log('🎉 Test final réussi!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Ouvrez la console du navigateur (F12)')
    console.log('   3. Regardez les logs "🔍 useNotifications:"')
    console.log('   4. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   5. Vous devriez voir toutes les notifications, y compris la nouvelle!')
    console.log('')
    console.log('🔧 Si les notifications n\'apparaissent toujours pas:')
    console.log('   - Vérifiez que l\'application Next.js tourne sur le port 3000')
    console.log('   - Vérifiez les logs de l\'application dans le terminal')
    console.log('   - Essayez de redémarrer l\'application avec "npm run dev"')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)