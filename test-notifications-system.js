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

async function testNotificationsSystem() {
  try {
    console.log('🧪 Test du système de notifications intelligentes...')
    
    // 1. Vérifier que la table notifications existe
    console.log('📋 1. Vérification de la table notifications...')
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.error('❌ Table notifications non accessible:', fetchError)
      return false
    }
    
    console.log('✅ Table notifications accessible')
    
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
    console.log(`✅ Utilisateur secrétaire: ${secretaire.name} (${secretaire.email})`)
    
    // 3. Créer une notification de test
    console.log('🔔 3. Création d\'une notification de test...')
    const testNotification = {
      user_id: secretaire.id,
      title: 'Test - Dossier soumis avec succès',
      message: 'Votre dossier DOSS-ACGE-TEST-001 a été soumis au Contrôleur Budgétaire pour validation.\n\nObjet: Test de notification\nBénéficiaire: Test Beneficiaire',
      type: 'SUCCESS',
      priority: 'MEDIUM',
      action_url: '/secretaire-dashboard',
      action_label: 'Voir mes dossiers',
      metadata: {
        dossierId: 'test-dossier-id',
        numeroDossier: 'DOSS-ACGE-TEST-001',
        submittedAt: new Date().toISOString()
      }
    }
    
    const { data: insertedNotification, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur création notification:', insertError)
      return false
    }
    
    console.log('✅ Notification de test créée:', insertedNotification[0].id)
    
    // 4. Tester la récupération des notifications
    console.log('📋 4. Test de récupération des notifications...')
    const { data: userNotifications, error: userNotificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
      .order('created_at', { ascending: false })
    
    if (userNotificationsError) {
      console.error('❌ Erreur récupération notifications:', userNotificationsError)
      return false
    }
    
    console.log(`✅ ${userNotifications.length} notifications trouvées pour l'utilisateur`)
    
    // 5. Tester les statistiques
    console.log('📊 5. Test des statistiques...')
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_notification_stats', { user_id_param: secretaire.id })
    
    if (statsError) {
      console.warn('⚠️ Fonction RPC stats non disponible, calcul manuel...')
      const unreadCount = userNotifications.filter(n => !n.is_read).length
      const highPriorityCount = userNotifications.filter(n => !n.is_read && n.priority === 'HIGH').length
      const urgentCount = userNotifications.filter(n => !n.is_read && n.priority === 'URGENT').length
      
      console.log(`📊 Stats calculées: ${userNotifications.length} total, ${unreadCount} non lues, ${highPriorityCount} haute priorité, ${urgentCount} urgentes`)
    } else {
      console.log('✅ Stats RPC:', statsData[0])
    }
    
    // 6. Tester le marquage comme lu
    console.log('✅ 6. Test du marquage comme lu...')
    const { error: markReadError } = await supabase
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', insertedNotification[0].id)
    
    if (markReadError) {
      console.error('❌ Erreur marquage comme lu:', markReadError)
      return false
    }
    
    console.log('✅ Notification marquée comme lue')
    
    // 7. Nettoyer les données de test
    console.log('🧹 7. Nettoyage des données de test...')
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', insertedNotification[0].id)
    
    if (deleteError) {
      console.warn('⚠️ Erreur nettoyage:', deleteError)
    } else {
      console.log('✅ Données de test nettoyées')
    }
    
    console.log('🎉 Test du système de notifications réussi!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test du système de notifications intelligentes')
  
  const success = await testNotificationsSystem()
  
  if (success) {
    console.log('✅ Le système de notifications est opérationnel!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Créez un dossier avec des données comptables')
    console.log('   2. Soumettez-le au CB')
    console.log('   3. Vérifiez les notifications dans la sidebar')
    console.log('   4. Testez la validation/rejet depuis le CB dashboard')
  } else {
    console.log('❌ Des erreurs ont été détectées dans le système de notifications')
  }
}

main().catch(console.error)
