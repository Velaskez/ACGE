/**
 * Script pour ajouter la colonne statut à la table folders
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addStatutColumn() {
  console.log('🔧 Ajout de la colonne statut à la table folders...')
  
  try {
    // 1. Ajouter la colonne statut
    console.log('📝 1. Ajout de la colonne statut...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE folders 
        ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'BROUILLON';
      `
    })

    if (alterError) {
      console.error('❌ Erreur ajout colonne:', alterError)
      throw alterError
    }
    console.log('✅ Colonne statut ajoutée')

    // 2. Mettre à jour les dossiers existants
    console.log('📝 2. Mise à jour des dossiers existants...')
    const { error: updateError } = await supabase
      .from('folders')
      .update({ statut: 'BROUILLON' })
      .is('statut', null)

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError)
      throw updateError
    }
    console.log('✅ Dossiers existants mis à jour')

    // 3. Créer l'index
    console.log('📝 3. Création de l\'index...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_folders_statut ON folders(statut);
      `
    })

    if (indexError) {
      console.error('❌ Erreur création index:', indexError)
      throw indexError
    }
    console.log('✅ Index créé')

    // 4. Vérifier que tout fonctionne
    console.log('📝 4. Vérification...')
    const { data: testFolder, error: testError } = await supabase
      .from('folders')
      .select('id, name, statut')
      .limit(1)
      .single()

    if (testError) {
      console.error('❌ Erreur test:', testError)
      throw testError
    }

    console.log('✅ Test réussi:', testFolder)
    console.log('🎉 Colonne statut ajoutée avec succès !')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

// Exécuter le script
addStatutColumn()
