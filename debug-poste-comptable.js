#!/usr/bin/env node

/**
 * Script de diagnostic pour les postes comptables
 * Vérifie les données dans la base de données et teste les APIs
 */

const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase (utilisez vos vraies valeurs)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugPostesComptables() {
  console.log('🔍 Diagnostic des postes comptables...\n')

  try {
    // 1. Vérifier les postes comptables disponibles
    console.log('1. Vérification des postes comptables:')
    const { data: postesComptables, error: postesError } = await supabase
      .from('postes_comptables')
      .select('*')
      .order('numero', { ascending: true })

    if (postesError) {
      console.error('❌ Erreur lors de la récupération des postes comptables:', postesError)
    } else {
      console.log(`✅ ${postesComptables?.length || 0} postes comptables trouvés:`)
      postesComptables?.forEach((poste, index) => {
        console.log(`   ${index + 1}. ${poste.numero} - ${poste.intitule} (ID: ${poste.id})`)
      })
    }

    // 2. Vérifier les dossiers en attente
    console.log('\n2. Vérification des dossiers en attente:')
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
      .eq('statut', 'EN_ATTENTE')
      .order('createdAt', { ascending: false })

    if (dossiersError) {
      console.error('❌ Erreur lors de la récupération des dossiers:', dossiersError)
    } else {
      console.log(`✅ ${dossiers?.length || 0} dossiers en attente trouvés:`)
      dossiers?.forEach((dossier, index) => {
        console.log(`   ${index + 1}. ${dossier.numeroDossier}`)
        console.log(`      Poste Comptable ID: ${dossier.posteComptableId}`)
        console.log(`      Poste Comptable Data:`, JSON.stringify(dossier.poste_comptable, null, 6))
        console.log(`      Statut: ${dossier.statut}`)
        console.log(`      Créé: ${dossier.createdAt}`)
        console.log('')
      })
    }

    // 3. Vérifier la structure de la table dossiers
    console.log('3. Vérification de la structure de la table dossiers:')
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_columns', { table_name: 'dossiers' })
      .single()

    if (structureError) {
      console.log('⚠️ Impossible de récupérer la structure de la table (normal en local)')
    } else {
      console.log('Structure de la table dossiers:', structure)
    }

    // 4. Tester l'API cb-pending
    console.log('\n4. Test de l\'API cb-pending:')
    try {
      const response = await fetch('http://localhost:3000/api/dossiers/cb-pending')
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API cb-pending fonctionne')
        console.log(`   ${data.dossiers?.length || 0} dossiers récupérés`)
        if (data.dossiers && data.dossiers.length > 0) {
          console.log('   Premier dossier:')
          const premier = data.dossiers[0]
          console.log(`     Numéro: ${premier.numeroDossier}`)
          console.log(`     Poste Comptable: ${premier.poste_comptable?.numero || 'N/A'} - ${premier.poste_comptable?.intitule || 'N/A'}`)
        }
      } else {
        console.error('❌ Erreur API cb-pending:', response.status, response.statusText)
      }
    } catch (apiError) {
      console.error('❌ Erreur lors du test de l\'API:', apiError.message)
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Exécuter le diagnostic
debugPostesComptables()
  .then(() => {
    console.log('\n✅ Diagnostic terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error)
    process.exit(1)
  })
