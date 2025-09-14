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

async function createTestNotifications() {
  try {
    console.log('🧪 Création de notifications de test...')
    
    // Récupérer un utilisateur existant
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé')
      return false
    }
    
    const user = users[0]
    console.log(`👤 Utilisateur de test: ${user.name} (${user.email})`)
    
    // Créer des notifications de test
    const testNotifications = [
      {
        user_id: user.id,
        title: 'Bienvenue dans ACGE',
        message: 'Votre compte a été configuré avec succès. Vous pouvez maintenant utiliser toutes les fonctionnalités.',
        type: 'SUCCESS',
        priority: 'MEDIUM',
        action_url: '/dashboard',
        action_label: 'Voir le tableau de bord'
      },
      {
        user_id: user.id,
        title: 'Nouveau dossier créé',
        message: 'Le dossier DOSS-ACGE-2025001 a été créé et est en attente de validation.',
        type: 'INFO',
        priority: 'LOW',
        action_url: '/cb-dashboard',
        action_label: 'Valider le dossier'
      },
      {
        user_id: user.id,
        title: 'Dossier rejeté',
        message: 'Le dossier DOSS-ACGE-2025002 a été rejeté. Veuillez consulter les motifs et corriger.',
        type: 'REJECTION',
        priority: 'HIGH',
        action_url: '/secretaire-rejected',
        action_label: 'Voir les détails'
      },
      {
        user_id: user.id,
        title: 'Maintenance programmée',
        message: 'Une maintenance est prévue dimanche de 2h à 4h. L\'application sera temporairement indisponible.',
        type: 'WARNING',
        priority: 'MEDIUM',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expire dans 7 jours
      },
      {
        user_id: user.id,
        title: 'Mise à jour disponible',
        message: 'Une nouvelle version de l\'application est disponible avec de nouvelles fonctionnalités.',
        type: 'SYSTEM',
        priority: 'LOW',
        action_url: '/settings',
        action_label: 'Voir les paramètres'
      }
    ]
    
    console.log(`📝 Création de ${testNotifications.length} notifications de test...`)
    
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur lors de la création des notifications:', insertError)
      return false
    }
    
    console.log('✅ Notifications de test créées avec succès!')
    console.log('📋 Notifications créées:')
    insertedNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority})`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la création
async function main() {
  console.log('🎯 Création de notifications de test')
  
  const success = await createTestNotifications()
  
  if (success) {
    console.log('🎉 Notifications de test créées!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre application (F5)')
    console.log('   2. Vérifiez la sidebar - vous devriez voir des notifications')
    console.log('   3. Cliquez sur "Voir toutes les notifications" pour tester la page complète')
    console.log('   4. Testez les filtres et actions dans la page /notifications')
  } else {
    console.log('❌ Échec de la création des notifications de test')
  }
}

main().catch(console.error)
