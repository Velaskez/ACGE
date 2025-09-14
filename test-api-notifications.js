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

async function testAPINotifications() {
  try {
    console.log('🧪 Test de l\'API notifications...')
    
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
    
    // 2. Tester l'API notifications
    console.log('🌐 2. Test de l\'API /api/notifications...')
    
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': secretaire.id
        }
      })
      
      if (!response.ok) {
        console.error('❌ Erreur API notifications:', response.status, response.statusText)
        return false
      }
      
      const apiData = await response.json()
      console.log('✅ API notifications fonctionne!')
      console.log(`📊 Données reçues:`, {
        notifications: apiData.notifications?.length || 0,
        stats: apiData.stats
      })
      
      // Afficher les notifications
      if (apiData.notifications && apiData.notifications.length > 0) {
        console.log('📋 Notifications reçues:')
        apiData.notifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
        })
      }
      
      return true
      
    } catch (fetchError) {
      console.error('❌ Erreur fetch API:', fetchError)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test de l\'API notifications')
  
  const success = await testAPINotifications()
  
  if (success) {
    console.log('🎉 Test réussi! L\'API notifications fonctionne!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Ouvrez la console du navigateur (F12)')
    console.log('   3. Les logs "🔍 useNotifications:" devraient maintenant montrer des notifications')
    console.log('   4. Vérifiez la section "Notifications" dans la sidebar')
    console.log('   5. Vous devriez voir toutes les notifications!')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
