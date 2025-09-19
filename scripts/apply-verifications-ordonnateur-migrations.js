#!/usr/bin/env node

/**
 * Script pour appliquer les migrations des vérifications ordonnateur
 * 
 * Ce script applique directement les migrations SQL via l'API Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
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

async function applyMigrations() {
  console.log('🚀 Application des migrations des vérifications ordonnateur...\n')

  try {
    // Migration 1: Créer les tables
    console.log('1. 📋 Création des tables...')
    
    const migration1Path = path.join(__dirname, '../supabase/migrations/20250131000001_create_verifications_ordonnateur_tables.sql')
    
    if (!fs.existsSync(migration1Path)) {
      console.error('❌ Fichier de migration 1 introuvable:', migration1Path)
      return false
    }
    
    const migration1SQL = fs.readFileSync(migration1Path, 'utf8')
    
    // Exécuter la migration par blocs pour éviter les timeouts
    const sqlBlocks = migration1SQL.split(';').filter(block => block.trim().length > 0)
    
    for (let i = 0; i < sqlBlocks.length; i++) {
      const sqlBlock = sqlBlocks[i].trim()
      if (sqlBlock.length === 0 || sqlBlock.startsWith('--')) continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: sqlBlock + ';' })
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️ Avertissement bloc ${i + 1}:`, error.message)
        }
      } catch (blockError) {
        console.warn(`⚠️ Erreur bloc ${i + 1}:`, blockError.message)
      }
    }
    
    console.log('✅ Migration 1 appliquée (création des tables)')

    // Migration 2: Insérer les données
    console.log('\n2. 📊 Insertion des données...')
    
    const migration2Path = path.join(__dirname, '../supabase/migrations/20250131000002_insert_verifications_ordonnateur_data.sql')
    
    if (!fs.existsSync(migration2Path)) {
      console.error('❌ Fichier de migration 2 introuvable:', migration2Path)
      return false
    }
    
    const migration2SQL = fs.readFileSync(migration2Path, 'utf8')
    
    // Exécuter la migration par blocs
    const dataBlocks = migration2SQL.split(';').filter(block => block.trim().length > 0)
    
    for (let i = 0; i < dataBlocks.length; i++) {
      const sqlBlock = dataBlocks[i].trim()
      if (sqlBlock.length === 0 || sqlBlock.startsWith('--')) continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: sqlBlock + ';' })
        if (error && !error.message.includes('duplicate key')) {
          console.warn(`⚠️ Avertissement données ${i + 1}:`, error.message)
        }
      } catch (blockError) {
        console.warn(`⚠️ Erreur données ${i + 1}:`, blockError.message)
      }
    }
    
    console.log('✅ Migration 2 appliquée (insertion des données)')

    // Vérification : Compter les enregistrements créés
    console.log('\n3. 🔍 Vérification des migrations...')
    
    const { data: categories, error: catError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select('*', { count: 'exact' })
    
    const { data: verifications, error: verifError } = await supabase
      .from('verifications_ordonnateur_types')
      .select('*', { count: 'exact' })
    
    if (catError) {
      console.error('❌ Erreur vérification catégories:', catError)
      return false
    }
    
    if (verifError) {
      console.error('❌ Erreur vérification types:', verifError)
      return false
    }
    
    console.log(`✅ ${categories?.length || 0} catégories créées`)
    console.log(`✅ ${verifications?.length || 0} vérifications créées`)

    // Test d'une requête avec relations
    console.log('\n4. 🔗 Test des relations...')
    
    const { data: categoriesAvecVerifications, error: relError } = await supabase
      .from('categories_verifications_ordonnateur')
      .select(`
        *,
        verifications:verifications_ordonnateur_types(
          id,
          nom,
          obligatoire
        )
      `)
      .limit(2)
    
    if (relError) {
      console.error('❌ Erreur test relations:', relError)
      return false
    }
    
    console.log('✅ Relations fonctionnelles :')
    categoriesAvecVerifications?.forEach(cat => {
      console.log(`  - ${cat.nom}: ${cat.verifications?.length || 0} vérifications`)
    })

    console.log('\n🎉 Migrations appliquées avec succès !')
    return true

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Fonction pour créer la fonction exec_sql si elle n'existe pas
async function ensureExecSqlFunction() {
  console.log('🔧 Vérification de la fonction exec_sql...')
  
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
    RETURNS TEXT
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public, pg_temp
    AS $$
    BEGIN
      EXECUTE sql;
      RETURN 'OK';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN SQLERRM;
    END;
    $$;
  `
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' })
    if (error && error.message.includes('function public.exec_sql(text) does not exist')) {
      // Créer la fonction via une requête directe
      const { error: createError } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0)
      
      // Cette approche ne fonctionne pas, essayons une autre méthode
      console.log('⚠️ Fonction exec_sql non disponible, les migrations pourraient échouer')
      return false
    }
    
    console.log('✅ Fonction exec_sql disponible')
    return true
  } catch (err) {
    console.log('⚠️ Impossible de vérifier exec_sql:', err.message)
    return false
  }
}

// Exécution du script
async function main() {
  await ensureExecSqlFunction()
  const success = await applyMigrations()
  
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

module.exports = { applyMigrations }
