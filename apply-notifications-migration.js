const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyNotificationsMigration() {
  try {
    console.log('🔧 Application de la migration notifications...')
    
    // 1. Lire le fichier de migration
    console.log('📋 1. Lecture du fichier de migration...')
    
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250114000001_create_notifications_table.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('✅ Fichier de migration lu')
    
    // 2. Diviser le SQL en sections pour exécution séparée
    console.log('🔧 2. Exécution de la migration...')
    
    // Exécuter le SQL complet
    const { error: migrationError } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    })
    
    if (migrationError) {
      console.warn('⚠️ Erreur migration (peut-être déjà appliquée):', migrationError.message)
    } else {
      console.log('✅ Migration appliquée avec succès')
    }
    
    // 3. Vérifier que la table existe
    console.log('📋 3. Vérification de la table...')
    
    const { data: tableCheck, error: tableError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table notifications non accessible:', tableError)
      return false
    }
    
    console.log('✅ Table notifications accessible')
    
    // 4. Créer une notification de test
    console.log('🔔 4. Création d\'une notification de test...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'SECRETAIRE')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur secrétaire trouvé')
      return false
    }
    
    const testNotification = {
      user_id: users[0].id,
      title: 'Migration notifications réussie',
      message: 'La table notifications a été créée avec succès. Le système de notifications intelligentes est maintenant opérationnel !',
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
    
    console.log('✅ Notification de test créée:', insertedNotification[0].id)
    
    // 5. Vérifier les fonctions RPC
    console.log('⚙️ 5. Test des fonctions RPC...')
    
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_notification_stats', { user_id_param: users[0].id })
    
    if (statsError) {
      console.warn('⚠️ Fonction RPC stats non disponible:', statsError.message)
    } else {
      console.log('✅ Fonction RPC stats fonctionne:', statsData[0])
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la migration
async function main() {
  console.log('🎯 Application de la migration notifications')
  
  const success = await applyNotificationsMigration()
  
  if (success) {
    console.log('🎉 Migration appliquée avec succès!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Vous devriez voir la notification de migration dans la sidebar')
    console.log('   3. Testez le rejet d\'un dossier depuis l\'interface CB')
    console.log('   4. Vérifiez que la notification apparaît dans l\'interface secrétaire')
  } else {
    console.log('❌ Échec de l\'application de la migration')
  }
}

main().catch(console.error)