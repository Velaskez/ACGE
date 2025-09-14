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

async function testNotifications() {
  try {
    console.log('🧪 Test du système de notifications...')
    
    // 1. Vérifier que la table existe
    console.log('1️⃣ Vérification de l\'existence de la table...')
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
    
    if (tablesError) {
      console.error('❌ Erreur lors de la vérification de la table:', tablesError)
      return false
    }
    
    if (!tables || tables.length === 0) {
      console.error('❌ Table notifications non trouvée')
      return false
    }
    
    console.log('✅ Table notifications trouvée')
    
    // 2. Vérifier la structure de la table
    console.log('2️⃣ Vérification de la structure de la table...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError)
      return false
    }
    
    console.log('📋 Colonnes de la table notifications:')
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // 3. Tester l'insertion d'une notification de test
    console.log('3️⃣ Test d\'insertion d\'une notification...')
    
    // Récupérer un utilisateur existant
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.warn('⚠️  Aucun utilisateur trouvé, impossible de tester l\'insertion')
      return true
    }
    
    const testUserId = users[0].id
    console.log(`👤 Utilisateur de test: ${testUserId}`)
    
    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: testUserId,
        title: 'Test de notification',
        message: 'Ceci est un test du système de notifications',
        type: 'INFO',
        priority: 'MEDIUM'
      })
      .select()
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion:', insertError)
      return false
    }
    
    console.log('✅ Notification de test insérée:', insertData[0].id)
    
    // 4. Tester la récupération des notifications
    console.log('4️⃣ Test de récupération des notifications...')
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError)
      return false
    }
    
    console.log(`✅ ${notifications.length} notification(s) récupérée(s)`)
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type})`)
    })
    
    // 5. Nettoyer la notification de test
    console.log('5️⃣ Nettoyage de la notification de test...')
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', insertData[0].id)
    
    if (deleteError) {
      console.warn('⚠️  Erreur lors du nettoyage:', deleteError)
    } else {
      console.log('✅ Notification de test supprimée')
    }
    
    console.log('🎉 Tous les tests sont passés avec succès!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter les tests
async function main() {
  console.log('🎯 Test du système de notifications')
  console.log('📍 URL Supabase:', supabaseUrl)
  
  const success = await testNotifications()
  
  if (success) {
    console.log('✅ Le système de notifications est opérationnel!')
    console.log('📋 Vous pouvez maintenant:')
    console.log('   1. Redémarrer l\'application')
    console.log('   2. Voir les notifications dans la sidebar')
    console.log('   3. Accéder à la page /notifications')
  } else {
    console.log('❌ Des problèmes ont été détectés')
    console.log('📞 Vérifiez la configuration de votre base de données')
  }
}

main().catch(console.error)
