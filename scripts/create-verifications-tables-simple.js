#!/usr/bin/env node

/**
 * Script simple pour créer les tables des vérifications ordonnateur
 * Utilise des requêtes SQL simples une par une
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTables() {
  console.log('🚀 Création des tables des vérifications ordonnateur...\n')

  try {
    // 1. Créer la table des catégories
    console.log('1. 📋 Création de la table categories_verifications_ordonnateur...')
    
    const createCategoriesSQL = `
      CREATE TABLE IF NOT EXISTS categories_verifications_ordonnateur (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nom TEXT NOT NULL,
        description TEXT,
        icone TEXT,
        couleur TEXT,
        ordre INTEGER NOT NULL,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    const { error: catError } = await supabase.rpc('exec_sql', { sql: createCategoriesSQL })
    if (catError) {
      console.error('❌ Erreur création catégories:', catError)
      return false
    }
    console.log('✅ Table categories_verifications_ordonnateur créée')

    // 2. Créer la table des types de vérifications
    console.log('\n2. 📋 Création de la table verifications_ordonnateur_types...')
    
    const createVerificationsSQL = `
      CREATE TABLE IF NOT EXISTS verifications_ordonnateur_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        categorie_id UUID NOT NULL,
        nom TEXT NOT NULL,
        description TEXT,
        question TEXT NOT NULL,
        aide TEXT,
        obligatoire BOOLEAN DEFAULT true,
        ordre INTEGER NOT NULL,
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    const { error: verifError } = await supabase.rpc('exec_sql', { sql: createVerificationsSQL })
    if (verifError) {
      console.error('❌ Erreur création vérifications:', verifError)
      return false
    }
    console.log('✅ Table verifications_ordonnateur_types créée')

    // 3. Créer la table des validations
    console.log('\n3. 📋 Création de la table validations_verifications_ordonnateur...')
    
    const createValidationsSQL = `
      CREATE TABLE IF NOT EXISTS validations_verifications_ordonnateur (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dossier_id TEXT NOT NULL,
        verification_id UUID NOT NULL,
        valide BOOLEAN NOT NULL,
        commentaire TEXT,
        piece_justificative_reference TEXT,
        valide_par TEXT NOT NULL,
        valide_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    const { error: validError } = await supabase.rpc('exec_sql', { sql: createValidationsSQL })
    if (validError) {
      console.error('❌ Erreur création validations:', validError)
      return false
    }
    console.log('✅ Table validations_verifications_ordonnateur créée')

    // 4. Créer la table des synthèses
    console.log('\n4. 📋 Création de la table syntheses_verifications_ordonnateur...')
    
    const createSynthesesSQL = `
      CREATE TABLE IF NOT EXISTS syntheses_verifications_ordonnateur (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        dossier_id TEXT NOT NULL UNIQUE,
        total_verifications INTEGER NOT NULL DEFAULT 0,
        verifications_validees INTEGER NOT NULL DEFAULT 0,
        verifications_rejetees INTEGER NOT NULL DEFAULT 0,
        commentaire_general TEXT,
        statut TEXT NOT NULL CHECK (statut IN ('EN_COURS', 'VALIDÉ', 'REJETÉ')) DEFAULT 'EN_COURS',
        valide_par TEXT NOT NULL,
        valide_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    
    const { error: synthError } = await supabase.rpc('exec_sql', { sql: createSynthesesSQL })
    if (synthError) {
      console.error('❌ Erreur création synthèses:', synthError)
      return false
    }
    console.log('✅ Table syntheses_verifications_ordonnateur créée')

    // 5. Insérer les catégories
    console.log('\n5. 📊 Insertion des catégories...')
    
    const categories = [
      {
        id: '10000000-0000-0000-0000-000000000001',
        nom: 'Vérifications de Légalité',
        description: 'Contrôles de conformité aux textes légaux et réglementaires',
        icone: 'gavel',
        couleur: 'blue',
        ordre: 1
      },
      {
        id: '10000000-0000-0000-0000-000000000002',
        nom: 'Vérifications de Service Fait',
        description: 'Contrôles de justification et certification du service rendu',
        icone: 'check-circle',
        couleur: 'green',
        ordre: 2
      },
      {
        id: '10000000-0000-0000-0000-000000000003',
        nom: 'Vérifications de Montants',
        description: 'Contrôles de cohérence et exactitude des montants',
        icone: 'calculator',
        couleur: 'orange',
        ordre: 3
      },
      {
        id: '10000000-0000-0000-0000-000000000004',
        nom: 'Vérifications de Conformité',
        description: 'Contrôles de respect des procédures et délais',
        icone: 'clipboard-check',
        couleur: 'purple',
        ordre: 4
      }
    ]
    
    const { error: insertCatError } = await supabase
      .from('categories_verifications_ordonnateur')
      .upsert(categories, { onConflict: 'id' })
    
    if (insertCatError) {
      console.error('❌ Erreur insertion catégories:', insertCatError)
      return false
    }
    console.log(`✅ ${categories.length} catégories insérées`)

    // 6. Insérer les vérifications (quelques exemples pour commencer)
    console.log('\n6. 📊 Insertion des vérifications...')
    
    const verifications = [
      // Légalité
      {
        id: '11000000-0000-0000-0000-000000000001',
        categorie_id: '10000000-0000-0000-0000-000000000001',
        nom: 'Habilitation des autorités administratives',
        description: 'Vérifier que l\'autorité qui a initié la demande est habilitée à le faire',
        question: 'L\'autorité administrative qui a initié cette demande est-elle habilitée à le faire ?',
        aide: 'Vérifiez les délégations de pouvoir, les limites de compétence et les habilitations en vigueur.',
        obligatoire: true,
        ordre: 1
      },
      {
        id: '11000000-0000-0000-0000-000000000002',
        categorie_id: '10000000-0000-0000-0000-000000000001',
        nom: 'Conformité aux textes légaux',
        description: 'Vérifier la conformité de l\'opération aux textes légaux et réglementaires',
        question: 'L\'opération est-elle conforme aux textes légaux et réglementaires en vigueur ?',
        aide: 'Consultez les lois, décrets et arrêtés applicables à ce type d\'opération.',
        obligatoire: true,
        ordre: 2
      },
      // Service Fait
      {
        id: '12000000-0000-0000-0000-000000000001',
        categorie_id: '10000000-0000-0000-0000-000000000002',
        nom: 'Justification du service rendu',
        description: 'Vérifier que le service a bien été rendu conformément aux spécifications',
        question: 'Le service a-t-il été rendu conformément aux spécifications ?',
        aide: 'Examinez les preuves de réalisation : rapports, procès-verbaux, attestations.',
        obligatoire: true,
        ordre: 1
      },
      // Montants
      {
        id: '13000000-0000-0000-0000-000000000001',
        categorie_id: '10000000-0000-0000-0000-000000000003',
        nom: 'Cohérence des montants entre documents',
        description: 'Vérifier la cohérence des montants entre tous les documents du dossier',
        question: 'Les montants sont-ils cohérents entre tous les documents du dossier ?',
        aide: 'Comparez les montants sur les factures, devis, bons de commande et autres pièces.',
        obligatoire: true,
        ordre: 1
      },
      // Conformité
      {
        id: '14000000-0000-0000-0000-000000000001',
        categorie_id: '10000000-0000-0000-0000-000000000004',
        nom: 'Respect des délais réglementaires',
        description: 'Vérifier le respect des délais légaux et réglementaires',
        question: 'Les délais réglementaires ont-ils été respectés ?',
        aide: 'Contrôlez les délais de paiement, de prescription et autres échéances légales.',
        obligatoire: true,
        ordre: 1
      }
    ]
    
    const { error: insertVerifError } = await supabase
      .from('verifications_ordonnateur_types')
      .upsert(verifications, { onConflict: 'id' })
    
    if (insertVerifError) {
      console.error('❌ Erreur insertion vérifications:', insertVerifError)
      return false
    }
    console.log(`✅ ${verifications.length} vérifications insérées`)

    // 7. Vérification finale
    console.log('\n7. 🔍 Vérification finale...')
    
    const { data: finalCategories, error: finalCatError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select('*')
    
    const { data: finalVerifications, error: finalVerifError } = await supabase
      .from('verifications_ordonnateur_types')
      .select('*')
    
    if (finalCatError || finalVerifError) {
      console.error('❌ Erreur vérification finale')
      return false
    }
    
    console.log(`✅ ${finalCategories?.length || 0} catégories créées`)
    console.log(`✅ ${finalVerifications?.length || 0} vérifications créées`)
    
    // Test des relations
    const { data: testRelations, error: relError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select(`
        nom,
        verifications:verifications_ordonnateur_types(nom)
      `)
      .limit(2)
    
    if (relError) {
      console.warn('⚠️ Test relations échoué:', relError)
    } else {
      console.log('✅ Relations testées avec succès')
      testRelations?.forEach(cat => {
        console.log(`  - ${cat.nom}: ${cat.verifications?.length || 0} vérifications`)
      })
    }

    console.log('\n🎉 Tables créées avec succès !')
    return true

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécution du script
async function main() {
  const success = await createTables()
  
  if (success) {
    console.log('\n✅ Script terminé avec succès')
    process.exit(0)
  } else {
    console.log('\n❌ Script terminé avec des erreurs')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { createTables }
