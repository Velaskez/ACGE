const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase (utilise l'URL trouvée dans les logs)
const supabaseUrl = 'https://wodyrsasfqfoqdydrfew.supabase.co'

// Essayer de trouver la clé API dans les variables d'environnement ou utiliser une approche différente
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Configuration Supabase:')
console.log('URL:', supabaseUrl)
console.log('Anon Key:', !!supabaseAnonKey)

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante')
  console.error('Définissez la variable d\'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addRejectionColumnsViaApp() {
  try {
    console.log('🔄 Tentative d\'ajout des colonnes via l\'API de l\'application...')
    
    // Vérifier si les colonnes existent déjà
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'dossiers')
      .in('column_name', ['rejectedAt', 'rejectionReason', 'rejectionDetails'])
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError)
      return false
    }
    
    const existingColumnNames = existingColumns.map(col => col.column_name)
    console.log('📋 Colonnes existantes:', existingColumnNames)
    
    if (existingColumnNames.length === 3) {
      console.log('✅ Toutes les colonnes de rejet existent déjà')
      return true
    }
    
    console.log('❌ Impossible d\'ajouter les colonnes via l\'API publique')
    console.log('💡 Solution: Utilisez l\'interface Supabase ou définissez SUPABASE_SERVICE_ROLE_KEY')
    
    return false
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    return false
  }
}

// Exécuter la fonction
addRejectionColumnsViaApp()
  .then(success => {
    if (success) {
      console.log('🎉 Colonnes de rejet ajoutées avec succès!')
    } else {
      console.log('💥 Échec de la migration')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
