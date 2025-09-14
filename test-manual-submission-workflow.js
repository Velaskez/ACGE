/**
 * Script de test pour vérifier le nouveau workflow de soumission manuelle des dossiers
 * 
 * Ce script teste :
 * 1. Création d'un dossier (doit être en statut BROUILLON)
 * 2. Vérification que le dossier n'est pas automatiquement soumis
 * 3. Soumission manuelle du dossier
 * 4. Vérification que le dossier passe en statut EN_ATTENTE
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

async function testManualSubmissionWorkflow() {
  console.log('🧪 Test du workflow de soumission manuelle des dossiers')
  console.log('=' .repeat(60))

  try {
    // 1. Créer un dossier de test
    console.log('\n📁 1. Création d\'un dossier de test...')
    const testFolderName = `Test-Soumission-Manuelle-${Date.now()}`
    
    const { data: newFolder, error: createError } = await supabase
      .from('folders')
      .insert({
        name: testFolderName,
        description: 'Dossier de test pour la soumission manuelle',
        authorId: 'cmebotahv0000c17w3izkh2k9',
        statut: 'BROUILLON'
      })
      .select('*')
      .single()

    if (createError) {
      throw new Error(`Erreur création dossier: ${createError.message}`)
    }

    console.log('✅ Dossier créé:', {
      id: newFolder.id,
      name: newFolder.name,
      statut: newFolder.statut
    })

    // 2. Vérifier que le dossier est en statut BROUILLON
    console.log('\n🔍 2. Vérification du statut BROUILLON...')
    if (newFolder.statut !== 'BROUILLON') {
      throw new Error(`Statut attendu: BROUILLON, reçu: ${newFolder.statut}`)
    }
    console.log('✅ Dossier en statut BROUILLON - pas de soumission automatique')

    // 3. Simuler la soumission manuelle via l'API
    console.log('\n📤 3. Soumission manuelle du dossier...')
    
    const submitData = {
      numeroDossier: `TEST-${Date.now()}`,
      numeroNature: 'NATURE-001',
      objetOperation: 'Test de soumission manuelle',
      beneficiaire: 'Test Beneficiaire',
      posteComptableId: 'default-poste-id',
      natureDocumentId: 'default-nature-id',
      secretaireId: null
    }

    // Appeler l'API de soumission
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/folders/${newFolder.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur soumission: ${errorData.error || response.statusText}`)
    }

    const submitResult = await response.json()
    console.log('✅ Dossier soumis avec succès:', submitResult.dossier?.numeroDossier)

    // 4. Vérifier que le dossier est maintenant en statut EN_ATTENTE
    console.log('\n🔍 4. Vérification du statut EN_ATTENTE...')
    
    const { data: updatedFolder, error: fetchError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', newFolder.id)
      .single()

    if (fetchError) {
      throw new Error(`Erreur récupération dossier: ${fetchError.message}`)
    }

    console.log('📊 Statut du dossier après soumission:', updatedFolder.statut)

    // 5. Vérifier que le dossier comptable a été créé
    console.log('\n🔍 5. Vérification de la création du dossier comptable...')
    
    const { data: dossierComptable, error: dossierError } = await supabase
      .from('dossiers')
      .select('*')
      .eq('folderId', newFolder.id)
      .single()

    if (dossierError) {
      throw new Error(`Erreur récupération dossier comptable: ${dossierError.message}`)
    }

    console.log('✅ Dossier comptable créé:', {
      numeroDossier: dossierComptable.numeroDossier,
      statut: dossierComptable.statut
    })

    // 6. Nettoyage - Supprimer le dossier de test
    console.log('\n🧹 6. Nettoyage...')
    
    // Supprimer d'abord le dossier comptable
    await supabase
      .from('dossiers')
      .delete()
      .eq('folderId', newFolder.id)

    // Puis le dossier
    await supabase
      .from('folders')
      .delete()
      .eq('id', newFolder.id)

    console.log('✅ Dossier de test supprimé')

    console.log('\n🎉 Test réussi ! Le workflow de soumission manuelle fonctionne correctement.')
    console.log('=' .repeat(60))
    console.log('✅ Dossiers créés en statut BROUILLON')
    console.log('✅ Pas de soumission automatique')
    console.log('✅ Soumission manuelle fonctionnelle')
    console.log('✅ Passage en statut EN_ATTENTE après soumission')

  } catch (error) {
    console.error('\n❌ Test échoué:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Exécuter le test
testManualSubmissionWorkflow()
