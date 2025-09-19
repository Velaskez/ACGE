const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function checkDossiersSchema() {
  try {
    console.log('🔍 Vérification du schéma de la table dossiers...');
    
    const { data, error } = await admin.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'dossiers' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }
    
    console.log('📋 Colonnes de la table dossiers:');
    console.log('Data reçue:', JSON.stringify(data, null, 2));
    
    if (Array.isArray(data)) {
      data.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Vérifier si montantOrdonnance existe
      const hasMontantOrdonnance = data.some(col => col.column_name === 'montantOrdonnance');
      console.log(`\n🔍 Colonne montantOrdonnance existe: ${hasMontantOrdonnance ? 'OUI' : 'NON'}`);
    } else {
      console.log('❌ Les données ne sont pas un tableau');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkDossiersSchema();
