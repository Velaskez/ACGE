import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createExecSqlFunction() {
  try {
    console.log('🔧 Création de la fonction exec_sql...')
    
    // Créer la fonction exec_sql qui permet d'exécuter du SQL arbitraire
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
        
        -- Donner les permissions nécessaires
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
      `
    })
    
    if (error) {
      console.log('⚠️ La fonction existe peut-être déjà, tentative de création directe...')
      
      // Essayer de créer directement via une requête SQL
      const { error: directError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      if (directError && directError.message.includes('function')) {
        console.log('💡 Création de la fonction via SQL direct...')
        
        // Utiliser une approche alternative : créer la fonction via une migration
        console.log('📝 Création de la fonction exec_sql...')
        
        // Note: Cette fonction doit être créée manuellement dans Supabase
        console.log('🔑 Pour créer la fonction exec_sql, allez dans Supabase Dashboard > SQL Editor et exécutez:')
        console.log(`
        CREATE OR REPLACE FUNCTION exec_sql(sql text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
        `)
        
        console.log('✅ Après avoir créé la fonction, relancez: npx tsx scripts/setup-rls-policies.ts')
        return
      }
    }
    
    console.log('✅ Fonction exec_sql créée avec succès!')
    console.log('🚀 Vous pouvez maintenant exécuter: npx tsx scripts/setup-rls-policies.ts')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la fonction:', error)
    
    if (error instanceof Error) {
      console.error('Message:', error.message)
    }
    
    console.log('💡 Solution alternative:')
    console.log('1. Allez dans Supabase Dashboard > SQL Editor')
    console.log('2. Exécutez le SQL de création de fonction')
    console.log('3. Relancez ce script')
  }
}

// Exécuter le script
createExecSqlFunction()
  .then(() => {
    console.log('🎉 Création de fonction terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
