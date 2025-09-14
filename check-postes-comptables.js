#!/usr/bin/env node

/**
 * Script pour vérifier les postes comptables dans la base de données
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPostesComptables() {
  console.log('🔍 Vérification des postes comptables dans la base de données...\n')

  try {
    // 1. Récupérer tous les postes comptables
    console.log('1. Tous les postes comptables:')
    const { data: allPostes, error: allError } = await supabase
      .from('postes_comptables')
      .select('*')
      .order('createdAt', { ascending: true })

    if (allError) {
      console.error('❌ Erreur:', allError)
    } else {
      console.log(`✅ ${allPostes?.length || 0} postes comptables trouvés:`)
      allPostes?.forEach((poste, index) => {
        console.log(`   ${index + 1}. ID: ${poste.id}`)
        console.log(`      Numéro: ${poste.numero}`)
        console.log(`      Intitulé: ${poste.intitule}`)
        console.log(`      Actif: ${poste.isActive}`)
        console.log(`      Créé: ${poste.createdAt}`)
        console.log('')
      })
    }

    // 2. Récupérer le premier poste comptable (comme dans l'API)
    console.log('2. Premier poste comptable (comme dans l\'API):')
    const { data: firstPoste, error: firstError } = await supabase
      .from('postes_comptables')
      .select('id, numero, intitule')
      .limit(1)

    if (firstError) {
      console.error('❌ Erreur:', firstError)
    } else if (firstPoste && firstPoste.length > 0) {
      console.log(`✅ Premier poste comptable: ${firstPoste[0].numero} - ${firstPoste[0].intitule} (ID: ${firstPoste[0].id})`)
    } else {
      console.log('⚠️ Aucun poste comptable trouvé')
    }

    // 3. Vérifier les dossiers récents
    console.log('\n3. Dossiers récents avec leurs postes comptables:')
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select(`
        id,
        numeroDossier,
        posteComptableId,
        poste_comptable:posteComptableId(*),
        statut,
        createdAt
      `)
      .order('createdAt', { ascending: false })
      .limit(5)

    if (dossiersError) {
      console.error('❌ Erreur:', dossiersError)
    } else {
      console.log(`✅ ${dossiers?.length || 0} dossiers récents:`)
      dossiers?.forEach((dossier, index) => {
        console.log(`   ${index + 1}. ${dossier.numeroDossier}`)
        console.log(`      Poste Comptable ID: ${dossier.posteComptableId}`)
        console.log(`      Poste Comptable: ${dossier.poste_comptable?.numero || 'N/A'} - ${dossier.poste_comptable?.intitule || 'N/A'}`)
        console.log(`      Statut: ${dossier.statut}`)
        console.log(`      Créé: ${dossier.createdAt}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter la vérification
checkPostesComptables()
  .then(() => {
    console.log('✅ Vérification terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
