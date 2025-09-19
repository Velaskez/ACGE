const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function fixMontantOrdonnanceCase() {
  try {
    console.log('🔧 Correction de la casse de la colonne montantOrdonnance...');
    
    // 1. Vérifier les colonnes existantes
    console.log('📋 1. Vérification des colonnes existantes...');
    const { data: columns, error: columnsError } = await admin.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'dossiers' 
        AND column_name ILIKE '%montant%';
      `
    });
    
    if (columnsError) {
      console.error('❌ Erreur vérification colonnes:', columnsError);
      return;
    }
    
    console.log('📊 Colonnes trouvées:', columns);
    
    // 2. Renommer la colonne pour respecter la casse
    console.log('🔄 2. Renommage de la colonne...');
    const { data: renameData, error: renameError } = await admin.rpc('exec_sql', {
      sql: `
        ALTER TABLE dossiers 
        RENAME COLUMN montantordonnance TO "montantOrdonnance";
      `
    });
    
    if (renameError) {
      console.error('❌ Erreur renommage:', renameError);
      return;
    }
    
    console.log('✅ Colonne renommée avec succès');
    
    // 3. Ajouter un commentaire
    console.log('📝 3. Ajout du commentaire...');
    const { data: commentData, error: commentError } = await admin.rpc('exec_sql', {
      sql: `
        COMMENT ON COLUMN dossiers."montantOrdonnance" IS 'Montant ordonnançé par l''ordonnateur';
      `
    });
    
    if (commentError) {
      console.warn('⚠️ Avertissement commentaire:', commentError.message);
    } else {
      console.log('✅ Commentaire ajouté');
    }
    
    // 4. Créer un index
    console.log('📊 4. Création de l\'index...');
    const { data: indexData, error: indexError } = await admin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_dossiers_montant_ordonnance ON dossiers("montantOrdonnance");
      `
    });
    
    if (indexError) {
      console.warn('⚠️ Avertissement index:', indexError.message);
    } else {
      console.log('✅ Index créé');
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
    
    console.log('🎉 Correction terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
  }
}

fixMontantOrdonnanceCase();
