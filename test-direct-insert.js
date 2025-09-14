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

async function testDirectInsert() {
  try {
    console.log('🧪 Test d\'insertion directe...')
    
    // Récupérer un utilisateur
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé:', usersError)
      return false
    }
    
    const user = users[0]
    console.log(`👤 Utilisateur: ${user.name} (${user.email})`)
    
    // Test 1: Insertion minimale
    console.log('📝 Test 1: Insertion minimale...')
    const minimalData = {
      user_id: user.id,
      title: 'Test minimal',
      message: 'Ceci est un test minimal'
    }
    
    const { data: insert1, error: error1 } = await supabase
      .from('notifications')
      .insert(minimalData)
      .select()
    
    if (error1) {
      console.error('❌ Erreur insertion minimale:', error1)
    } else {
      console.log('✅ Insertion minimale réussie:', insert1[0].id)
      
      // Nettoyer
      await supabase
        .from('notifications')
        .delete()
        .eq('id', insert1[0].id)
      console.log('🧹 Nettoyé')
    }
    
    // Test 2: Avec type et priority
    console.log('📝 Test 2: Avec type et priority...')
    const withTypesData = {
      user_id: user.id,
      title: 'Test avec types',
      message: 'Ceci est un test avec types',
      type: 'INFO',
      priority: 'MEDIUM'
    }
    
    const { data: insert2, error: error2 } = await supabase
      .from('notifications')
      .insert(withTypesData)
      .select()
    
    if (error2) {
      console.error('❌ Erreur insertion avec types:', error2)
    } else {
      console.log('✅ Insertion avec types réussie:', insert2[0].id)
      
      // Nettoyer
      await supabase
        .from('notifications')
        .delete()
        .eq('id', insert2[0].id)
      console.log('🧹 Nettoyé')
    }
    
    // Test 3: Récupération
    console.log('📝 Test 3: Récupération des notifications...')
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .limit(5)
    
    if (fetchError) {
      console.error('❌ Erreur récupération:', fetchError)
    } else {
      console.log(`✅ Récupération réussie: ${notifications.length} notifications`)
      notifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title} (${notif.type || 'N/A'})`)
      })
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test d\'insertion directe dans notifications')
  
  const success = await testDirectInsert()
  
  if (success) {
    console.log('✅ Tests terminés!')
  } else {
    console.log('❌ Des erreurs ont été détectées')
  }
}

main().catch(console.error)
