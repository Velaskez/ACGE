const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAndFixMontantOrdonnance() {
  try {
    console.log('🔍 Vérification et correction de la colonne montantOrdonnance...');
    
    // 1. Vérifier si la colonne existe
    console.log('📋 1. Vérification de l\'existence de la colonne...');
    const { data: columns, error: columnsError } = await admin.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'dossiers' 
        AND column_name = 'montantOrdonnance';
      `
    });
    
    if (columnsError) {
      console.error('❌ Erreur vérification colonnes:', columnsError);
      return;
    }
    
    console.log('📊 Résultat vérification:', columns);
    
    if (columns && columns.length > 0) {
      console.log('✅ La colonne montantOrdonnance existe déjà');
      console.log('📋 Détails:', columns[0]);
    } else {
      console.log('❌ La colonne montantOrdonnance n\'existe pas, création...');
      
      // 2. Créer la colonne
      const { data: createData, error: createError } = await admin.rpc('exec_sql', {
        sql: `
          ALTER TABLE dossiers 
          ADD COLUMN montantOrdonnance DECIMAL(15,2);
        `
      });
      
      if (createError) {
        console.error('❌ Erreur création colonne:', createError);
        return;
      }
      
      console.log('✅ Colonne montantOrdonnance créée avec succès');
      
      // 3. Ajouter un commentaire
      const { data: commentData, error: commentError } = await admin.rpc('exec_sql', {
        sql: `
          COMMENT ON COLUMN dossiers.montantOrdonnance IS 'Montant ordonnançé par l''ordonnateur';
        `
      });
      
      if (commentError) {
        console.warn('⚠️ Avertissement commentaire:', commentError.message);
      } else {
        console.log('✅ Commentaire ajouté');
      }
      
      // 4. Créer un index
      const { data: indexData, error: indexError } = await admin.rpc('exec_sql', {
        sql: `
          CREATE INDEX IF NOT EXISTS idx_dossiers_montant_ordonnance ON dossiers(montantOrdonnance);
        `
      });
      
      if (indexError) {
        console.warn('⚠️ Avertissement index:', indexError.message);
      } else {
        console.log('✅ Index créé');
      }
    }
    
    // 5. Tester la colonne
    console.log('🧪 5. Test de la colonne...');
    const { data: testData, error: testError } = await admin
      .from('dossiers')
      .select('id, numeroDossier, montantOrdonnance')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur test colonne:', testError);
      return;
    }
    
    console.log('✅ Test réussi ! Colonne accessible:', testData[0]);
    
    console.log('🎉 Vérification et correction terminées avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

verifyAndFixMontantOrdonnance();
