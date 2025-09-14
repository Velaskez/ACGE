const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Charger les variables d'environnement depuis .env.local ou .env
require('dotenv').config({ path: path.join(__dirname, '.env.local') })
require('dotenv').config({ path: path.join(__dirname, '.env') })

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Configuration Supabase:')
console.log('URL:', !!supabaseUrl)
console.log('Service Key:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('Vérifiez que NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définies')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function addRejectionColumns() {
  try {
    console.log('🔄 Ajout des colonnes de rejet à la table dossiers...')
    
    // Vérifier d'abord si les colonnes existent déjà
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'dossiers')
      .in('column_name', ['rejectedAt', 'rejectionReason', 'rejectionDetails'])
    
    if (checkError) {
      console.error('❌ Erreur lors de la vérification des colonnes existantes:', checkError)
      return false
    }
    
    const existingColumnNames = existingColumns.map(col => col.column_name)
    console.log('📋 Colonnes existantes:', existingColumnNames)
    
    if (existingColumnNames.length === 3) {
      console.log('✅ Toutes les colonnes de rejet existent déjà')
      return true
    }
    
    // Ajouter les colonnes manquantes une par une
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
    
    // Créer les index
    console.log('🔄 Création des index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_dossiers_rejected_at ON dossiers("rejectedAt");
        CREATE INDEX IF NOT EXISTS idx_dossiers_rejection_reason ON dossiers("rejectionReason");
      `
    })
    
    if (indexError) {
      console.warn('⚠️ Erreur lors de la création des index (non critique):', indexError)
    } else {
      console.log('✅ Index créés avec succès')
    }
    
    console.log('✅ Colonnes de rejet ajoutées avec succès')
    
    // Vérifier que les colonnes ont été ajoutées
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'dossiers')
      .in('column_name', ['rejectedAt', 'rejectionReason', 'rejectionDetails'])
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError)
      return false
    }
    
    console.log('📋 Colonnes ajoutées:')
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    return false
  }
}

// Exécuter la fonction
addRejectionColumns()
  .then(success => {
    if (success) {
      console.log('🎉 Migration terminée avec succès!')
    } else {
      console.log('💥 Migration échouée')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
