/**
 * Script de test pour les notifications dans la sidebar
 * Ce script crée des notifications de test avec différentes priorités et statuts
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTestNotifications() {
  try {
    console.log('🔍 Création des notifications de test...')

    // Récupérer un utilisateur de test (premier utilisateur trouvé)
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé:', usersError)
      return
    }

    const userId = users[0].id
    console.log('👤 Utilisateur de test:', userId)

    // Supprimer les anciennes notifications de test
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .like('title', 'Test%')

    // Créer des notifications de test avec différents statuts et priorités
    const testNotifications = [
      {
        user_id: userId,
        title: 'Test - Notification urgente',
        message: 'Ceci est une notification urgente pour tester l\'affichage',
        type: 'URGENT',
        priority: 'URGENT',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString() // Il y a 5 minutes
      },
      {
        user_id: userId,
        title: 'Test - Notification haute priorité',
        message: 'Notification avec priorité élevée',
        type: 'WARNING',
        priority: 'HIGH',
        is_read: false,
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // Il y a 15 minutes
      },
      {
        user_id: userId,
        title: 'Test - Notification lue',
        message: 'Cette notification a déjà été lue',
        type: 'INFO',
        priority: 'MEDIUM',
        is_read: true,
        read_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // Il y a 30 minutes
      },
      {
        user_id: userId,
        title: 'Test - Notification récente',
        message: 'Notification créée récemment',
        type: 'SUCCESS',
        priority: 'LOW',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString() // Il y a 2 minutes
      },
      {
        user_id: userId,
        title: 'Test - Ancienne notification lue',
        message: 'Ancienne notification déjà lue',
        type: 'INFO',
        priority: 'MEDIUM',
        is_read: true,
        read_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Il y a 2 heures
      }
    ]

    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)

    if (error) {
      console.error('❌ Erreur lors de la création des notifications:', error)
      return
    }

    console.log('✅ Notifications de test créées avec succès!')
    console.log('📋 Résumé des notifications créées:')
    testNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })

    // Vérifier le tri attendu
    console.log('\n🔍 Vérification du tri attendu:')
    console.log('1. Notifications non lues en premier (par ordre de priorité)')
    console.log('2. Puis notifications lues (par date de création décroissante)')
    console.log('\nOrdre attendu:')
    console.log('1. Test - Notification urgente (URGENT, non lue)')
    console.log('2. Test - Notification récente (LOW, non lue)')
    console.log('3. Test - Notification haute priorité (HIGH, non lue)')
    console.log('4. Test - Notification lue (MEDIUM, lue)')
    console.log('5. Test - Ancienne notification lue (MEDIUM, lue)')

  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications de test:', error)
  }
}

// Exécuter le script
createTestNotifications()
  .then(() => {
    console.log('\n✅ Script terminé!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })