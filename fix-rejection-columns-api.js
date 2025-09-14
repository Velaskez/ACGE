const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase (utilise les variables d'environnement du système)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wodyrsasfqfoqdydrfew.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Configuration Supabase:')
console.log('URL:', supabaseUrl)
console.log('Service Key:', !!supabaseServiceKey)

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquante')
  console.error('Définissez la variable d\'environnement SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixRejectionColumns() {
  try {
    console.log('🔄 Vérification et ajout des colonnes de rejet...')
    
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
    
    // Ajouter les colonnes manquantes
    const columnsToAdd = [
      { name: 'rejectedAt', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'rejectionReason', type: 'TEXT' },
      { name: 'rejectionDetails', type: 'TEXT' }
    ]
    
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`🔄 Ajout de la colonne ${column.name}...`)
        
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS "${column.name}" ${column.type};`
        })
        
        if (alterError) {
          console.error(`❌ Erreur lors de l'ajout de ${column.name}:`, alterError)
          return false
        }
        
        console.log(`✅ Colonne ${column.name} ajoutée avec succès`)
      }
    }
    
    console.log('✅ Migration terminée avec succès!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    return false
  }
}

// Exécuter la fonction
fixRejectionColumns()
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
