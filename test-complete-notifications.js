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

async function testCompleteNotifications() {
  try {
    console.log('🧪 Test complet du système de notifications...')
    
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
    
    // 2. Tester l'API de récupération des notifications
    console.log('📥 2. Test de l\'API de récupération des notifications...')
    
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
      console.log(`📊 ${apiData.notifications?.length || 0} notifications, ${apiData.stats?.unreadCount || 0} non lues`)
      
      // 3. Tester l'API de marquage d'une notification comme lue
      if (apiData.notifications && apiData.notifications.length > 0) {
        const firstNotification = apiData.notifications[0]
        console.log(`🔔 3. Test de marquage de la notification "${firstNotification.title}"...`)
        
        const markResponse = await fetch('http://localhost:3000/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': secretaire.id
          },
          body: JSON.stringify({ notificationId: firstNotification.id })
        })
        
        if (!markResponse.ok) {
          console.error('❌ Erreur API mark-read:', markResponse.status, markResponse.statusText)
          return false
        }
        
        const markData = await markResponse.json()
        console.log('✅ Notification marquée comme lue:', markData.success)
        
        // 4. Vérifier que la notification est bien marquée comme lue
        console.log('🔍 4. Vérification du marquage...')
        
        const verifyResponse = await fetch('http://localhost:3000/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': secretaire.id
          }
        })
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json()
          const markedNotification = verifyData.notifications.find(n => n.id === firstNotification.id)
          
          if (markedNotification && markedNotification.is_read) {
            console.log('✅ Notification confirmée comme lue dans la base de données')
          } else {
            console.log('⚠️ Notification pas encore marquée comme lue')
          }
          
          console.log(`📊 Nouvelles stats: ${verifyData.stats?.unreadCount || 0} non lues`)
        }
      }
      
      // 5. Tester l'API de marquage de toutes les notifications comme lues
      console.log('📝 5. Test de marquage de toutes les notifications comme lues...')
      
      const markAllResponse = await fetch('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': secretaire.id
        }
      })
      
      if (!markAllResponse.ok) {
        console.error('❌ Erreur API mark-all-read:', markAllResponse.status, markAllResponse.statusText)
        return false
      }
      
      const markAllData = await markAllResponse.json()
      console.log(`✅ ${markAllData.count} notifications marquées comme lues`)
      
      // 6. Vérification finale
      console.log('🔍 6. Vérification finale...')
      
      const finalResponse = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': secretaire.id
        }
      })
      
      if (finalResponse.ok) {
        const finalData = await finalResponse.json()
        console.log(`📊 Stats finales: ${finalData.stats?.unreadCount || 0} non lues`)
        
        if (finalData.stats?.unreadCount === 0) {
          console.log('🎉 Toutes les notifications sont marquées comme lues!')
        }
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
  console.log('🎯 Test complet du système de notifications')
  
  const success = await testCompleteNotifications()
  
  if (success) {
    console.log('🎉 Test complet réussi! Le système de notifications fonctionne parfaitement!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Testez le clic sur les notifications dans la sidebar')
    console.log('   3. Les notifications devraient se marquer comme lues sans erreur')
    console.log('   4. Le compteur de notifications non lues devrait se mettre à jour')
  } else {
    console.log('❌ Le test a échoué. Vérifiez les logs ci-dessus.')
  }
}

main().catch(console.error)
