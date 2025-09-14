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

async function checkTableStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table notifications...')
    
    // Vérifier si la table existe
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
    
    // Vérifier la structure des colonnes
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
      .order('ordinal_position')
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError)
      return false
    }
    
    console.log('📋 Structure de la table notifications:')
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    // Tester une insertion simple
    console.log('🧪 Test d\'insertion simple...')
    
    // Récupérer un utilisateur
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur trouvé')
      return false
    }
    
    const testData = {
      user_id: users[0].id,
      title: 'Test simple',
      message: 'Ceci est un test'
    }
    
    console.log('📝 Données de test:', testData)
    
    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion de test:', insertError)
      return false
    }
    
    console.log('✅ Insertion de test réussie:', insertData[0].id)
    
    // Nettoyer
    await supabase
      .from('notifications')
      .delete()
      .eq('id', insertData[0].id)
    
    console.log('🧹 Données de test nettoyées')
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la vérification
async function main() {
  console.log('🎯 Vérification de la structure de la table')
  
  const success = await checkTableStructure()
  
  if (success) {
    console.log('✅ La table notifications est prête!')
  } else {
    console.log('❌ Problème détecté avec la table notifications')
  }
}

main().catch(console.error)
