const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function createSynthesesControlesFondTable() {
  try {
    console.log('🔧 Création de la table syntheses_controles_fond...');
    
    // Créer la table de synthèse des contrôles de fond
    const { data: createTable, error: createError } = await admin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS syntheses_controles_fond (
            dossier_id TEXT PRIMARY KEY REFERENCES dossiers(id) ON DELETE CASCADE,
            total_controles INTEGER NOT NULL,
            controles_valides INTEGER NOT NULL,
            controles_rejetes INTEGER NOT NULL,
            statut TEXT NOT NULL CHECK (statut IN ('EN_ATTENTE', 'EN_COURS', 'VALIDÉ', 'REJETÉ')),
            commentaire_general TEXT,
            valide_par TEXT REFERENCES users(id),
            valide_le TIMESTAMP WITH TIME ZONE,
            last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Erreur lors de la création de la table:', createError);
      return;
    }
    
    console.log('✅ Table syntheses_controles_fond créée avec succès');
    
    // Ajouter des commentaires sur la table et les colonnes
    const { data: comment1, error: commentError1 } = await admin.rpc('exec_sql', {
      sql: `
        COMMENT ON TABLE syntheses_controles_fond IS 'Synthèse des contrôles de fond par dossier';
        COMMENT ON COLUMN syntheses_controles_fond.total_controles IS 'Nombre total de contrôles à effectuer';
        COMMENT ON COLUMN syntheses_controles_fond.controles_valides IS 'Nombre de contrôles validés';
        COMMENT ON COLUMN syntheses_controles_fond.controles_rejetes IS 'Nombre de contrôles rejetés';
        COMMENT ON COLUMN syntheses_controles_fond.statut IS 'Statut global des contrôles (EN_ATTENTE, EN_COURS, VALIDÉ, REJETÉ)';
        COMMENT ON COLUMN syntheses_controles_fond.commentaire_general IS 'Commentaire général du CB sur les contrôles';
      `
    });
    
    if (commentError1) {
      console.warn('⚠️ Avertissement commentaires:', commentError1.message);
    } else {
      console.log('✅ Commentaires ajoutés');
    }
    
    // Créer des index pour les performances
    const { data: index1, error: indexError1 } = await admin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_syntheses_controles_fond_statut ON syntheses_controles_fond(statut);
        CREATE INDEX IF NOT EXISTS idx_syntheses_controles_fond_valide_le ON syntheses_controles_fond(valide_le);
      `
    });
    
    if (indexError1) {
      console.warn('⚠️ Avertissement index:', indexError1.message);
    } else {
      console.log('✅ Index créés');
    }
    
    // Créer des politiques RLS
    const { data: rls, error: rlsError } = await admin.rpc('exec_sql', {
      sql: `
        ALTER TABLE syntheses_controles_fond ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Lecture des synthèses par tous les utilisateurs connectés" ON syntheses_controles_fond
            FOR SELECT USING (true);
        
        CREATE POLICY "Création des synthèses par les CB" ON syntheses_controles_fond
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid()::text 
                    AND users.role = 'CONTROLEUR_BUDGETAIRE'
                )
            );
        
        CREATE POLICY "Modification des synthèses par les CB" ON syntheses_controles_fond
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid()::text 
                    AND users.role = 'CONTROLEUR_BUDGETAIRE'
                )
            );
      `
    });
    
    if (rlsError) {
      console.warn('⚠️ Avertissement RLS:', rlsError.message);
    } else {
      console.log('✅ Politiques RLS créées');
    }
    
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

createSynthesesControlesFondTable();
