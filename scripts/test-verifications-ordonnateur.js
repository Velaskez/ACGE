#!/usr/bin/env node

/**
 * Script de test pour les vérifications ordonnateur
 * 
 * Ce script :
 * 1. Teste la récupération des vérifications ordonnateur
 * 2. Teste la validation des vérifications sur un dossier
 * 3. Teste l'ordonnancement avec les nouvelles vérifications
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testVerificationsOrdonnateur() {
  console.log('🚀 Test des vérifications ordonnateur...\n')

  try {
    // Test 1: Vérifier que les tables existent
    console.log('1. 📋 Vérification des tables...')
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select('*')
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ Erreur catégories:', categoriesError)
      return false
    }
    
    console.log(`✅ ${categories?.length || 0} catégories trouvées`)
    
    const { data: verifications, error: verificationsError } = await supabase
      .from('verifications_ordonnateur_types')
      .select('*')
      .limit(10)
    
    if (verificationsError) {
      console.error('❌ Erreur vérifications:', verificationsError)
      return false
    }
    
    console.log(`✅ ${verifications?.length || 0} vérifications trouvées\n`)

    // Test 2: Tester la récupération des vérifications avec relations
    console.log('2. 🔍 Test de récupération des vérifications avec relations...')
    
    const { data: categoriesAvecVerifications, error: relationsError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select(`
        *,
        verifications:verifications_ordonnateur_types(
          id,
          nom,
          description,
          question,
          aide,
          obligatoire,
          ordre
        )
      `)
      .eq('actif', true)
      .order('ordre')
    
    if (relationsError) {
      console.error('❌ Erreur relations:', relationsError)
      return false
    }
    
    console.log(`✅ ${categoriesAvecVerifications?.length || 0} catégories avec vérifications`)
    
    categoriesAvecVerifications?.forEach(cat => {
      console.log(`  - ${cat.nom}: ${cat.verifications?.length || 0} vérifications`)
    })
    console.log()

    // Test 3: Chercher un dossier validé par CB pour les tests
    console.log('3. 📁 Recherche d\'un dossier validé par CB...')
    
    const { data: dossiers, error: dossiersError } = await supabase
      .from('dossiers')
      .select('id, numeroDossier, statut')
      .eq('statut', 'VALIDÉ_CB')
      .limit(1)
    
    if (dossiersError) {
      console.error('❌ Erreur dossiers:', dossiersError)
      return false
    }
    
    if (!dossiers || dossiers.length === 0) {
      console.log('⚠️ Aucun dossier VALIDÉ_CB trouvé. Création d\'un dossier de test...')
      
      // Créer un dossier de test
      const { data: nouveauDossier, error: creationError } = await supabase
        .from('dossiers')
        .insert({
          numeroDossier: 'TEST-VERIF-' + Date.now(),
          numeroNature: 'TEST-001',
          objetOperation: 'Test des vérifications ordonnateur',
          beneficiaire: 'Test Bénéficiaire',
          dateDepot: new Date().toISOString(),
          statut: 'VALIDÉ_CB',
          posteComptableId: '00000000-0000-0000-0000-000000000001', // Utiliser un UUID par défaut
          natureDocumentId: '00000000-0000-0000-0000-000000000001',
          secretaireId: 'test-user-id'
        })
        .select()
        .single()
      
      if (creationError) {
        console.error('❌ Erreur création dossier test:', creationError)
        return false
      }
      
      console.log(`✅ Dossier test créé: ${nouveauDossier.numeroDossier}`)
      dossiers.push(nouveauDossier)
    } else {
      console.log(`✅ Dossier trouvé: ${dossiers[0].numeroDossier}`)
    }

    const dossierTest = dossiers[0]

    // Test 4: Tester la validation des vérifications
    console.log('\n4. ✅ Test de validation des vérifications...')
    
    // Préparer des validations de test
    const validationsTest = verifications?.slice(0, 5).map(verif => ({
      verification_id: verif.id,
      valide: Math.random() > 0.3, // 70% de chance d'être validé
      commentaire: `Test validation pour ${verif.nom}`,
      piece_justificative_reference: `Pièce-${Math.floor(Math.random() * 1000)}`
    })) || []
    
    // Simuler l'insertion des validations
    const { data: validationsCreees, error: validationError } = await supabase
      .from('validations_verifications_ordonnateur')
      .insert(
        validationsTest.map(validation => ({
          dossier_id: dossierTest.id,
          verification_id: validation.verification_id,
          valide: validation.valide,
          commentaire: validation.commentaire,
          piece_justificative_reference: validation.piece_justificative_reference,
          valide_par: 'test-user-id',
          valide_le: new Date().toISOString()
        }))
      )
      .select()
    
    if (validationError) {
      console.error('❌ Erreur validation:', validationError)
      return false
    }
    
    console.log(`✅ ${validationsCreees?.length || 0} validations créées`)

    // Test 5: Créer la synthèse
    console.log('\n5. 📊 Test de création de synthèse...')
    
    const totalVerifications = validationsTest.length
    const verificationsValidees = validationsTest.filter(v => v.valide).length
    const verificationsRejetees = totalVerifications - verificationsValidees
    
    const { data: synthese, error: syntheseError } = await supabase
      .from('syntheses_verifications_ordonnateur')
      .upsert({
        dossier_id: dossierTest.id,
        total_verifications: totalVerifications,
        verifications_validees: verificationsValidees,
        verifications_rejetees: verificationsRejetees,
        commentaire_general: 'Test de synthèse des vérifications ordonnateur',
        statut: verificationsRejetees === 0 ? 'VALIDÉ' : 'REJETÉ',
        valide_par: 'test-user-id',
        valide_le: new Date().toISOString()
      }, {
        onConflict: 'dossier_id'
      })
      .select()
      .single()
    
    if (syntheseError) {
      console.error('❌ Erreur synthèse:', syntheseError)
      return false
    }
    
    console.log(`✅ Synthèse créée: ${synthese.statut} (${synthese.verifications_validees}/${synthese.total_verifications})`)

    // Test 6: Tester la récupération des validations
    console.log('\n6. 📖 Test de récupération des validations...')
    
    const { data: validationsRecuperees, error: recuperationError } = await supabase
      .from('validations_verifications_ordonnateur')
      .select(`
        *,
        verification:verifications_ordonnateur_types(
          *,
          categorie:categories_verifications_ordonnateur(*)
        )
      `)
      .eq('dossier_id', dossierTest.id)
    
    if (recuperationError) {
      console.error('❌ Erreur récupération:', recuperationError)
      return false
    }
    
    console.log(`✅ ${validationsRecuperees?.length || 0} validations récupérées avec détails`)

    // Test 7: Statistiques finales
    console.log('\n7. 📈 Statistiques finales...')
    
    const { data: statsCategories } = await supabase
      .from('categories_verifications_ordonnateur')
      .select('*', { count: 'exact' })
    
    const { data: statsVerifications } = await supabase
      .from('verifications_ordonnateur_types')
      .select('*', { count: 'exact' })
    
    const { data: statsValidations } = await supabase
      .from('validations_verifications_ordonnateur')
      .select('*', { count: 'exact' })
    
    const { data: statsSyntheses } = await supabase
      .from('syntheses_verifications_ordonnateur')
      .select('*', { count: 'exact' })
    
    console.log('📊 Statistiques des tables :')
    console.log(`  - Catégories: ${statsCategories?.length || 0}`)
    console.log(`  - Vérifications: ${statsVerifications?.length || 0}`)
    console.log(`  - Validations: ${statsValidations?.length || 0}`)
    console.log(`  - Synthèses: ${statsSyntheses?.length || 0}`)

    console.log('\n🎉 Tous les tests sont passés avec succès !')
    return true

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Fonction pour nettoyer les données de test
async function cleanupTestData() {
  console.log('\n🧹 Nettoyage des données de test...')
  
  try {
    // Supprimer les dossiers de test
    await supabase
      .from('dossiers')
      .delete()
      .like('numeroDossier', 'TEST-VERIF-%')
    
    console.log('✅ Données de test nettoyées')
  } catch (error) {
    console.warn('⚠️ Erreur nettoyage:', error)
  }
}

// Exécution du script
async function main() {
  const success = await testVerificationsOrdonnateur()
  
  if (success) {
    console.log('\n✅ Script terminé avec succès')
    
    // Demander si on veut nettoyer
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    readline.question('\nVoulez-vous nettoyer les données de test ? (y/N): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await cleanupTestData()
      }
      readline.close()
      process.exit(0)
    })
  } else {
    console.log('\n❌ Script terminé avec des erreurs')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { testVerificationsOrdonnateur }
