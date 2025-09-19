const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey);

async function createQuitusTable() {
  try {
    console.log('🔧 Création de la table quitus...');
    
    // Créer la table quitus
    const { data: createTable, error: createError } = await admin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quitus (
            id TEXT PRIMARY KEY,
            dossier_id TEXT NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
            contenu JSONB NOT NULL,
            statut TEXT NOT NULL CHECK (statut IN ('GÉNÉRÉ', 'TÉLÉCHARGÉ', 'ARCHIVÉ')) DEFAULT 'GÉNÉRÉ',
            genere_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            telecharge_le TIMESTAMP WITH TIME ZONE,
            archive_le TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Erreur lors de la création de la table:', createError);
      return;
    }
    
    console.log('✅ Table quitus créée avec succès');
    
    // Ajouter des commentaires sur la table et les colonnes
    const { data: comment, error: commentError } = await admin.rpc('exec_sql', {
      sql: `
        COMMENT ON TABLE quitus IS 'Table des quitus générés pour les dossiers validés définitivement';
        COMMENT ON COLUMN quitus.id IS 'Identifiant unique du quitus (ex: QUITUS-DOSS-ACGE-2025875-2025)';
        COMMENT ON COLUMN quitus.dossier_id IS 'Référence vers le dossier associé';
        COMMENT ON COLUMN quitus.contenu IS 'Contenu complet du quitus en format JSON';
        COMMENT ON COLUMN quitus.statut IS 'Statut du quitus (GÉNÉRÉ, TÉLÉCHARGÉ, ARCHIVÉ)';
        COMMENT ON COLUMN quitus.genere_le IS 'Date et heure de génération du quitus';
        COMMENT ON COLUMN quitus.telecharge_le IS 'Date et heure du premier téléchargement';
        COMMENT ON COLUMN quitus.archive_le IS 'Date et heure d''archivage du quitus';
      `
    });
    
    if (commentError) {
      console.warn('⚠️ Avertissement commentaires:', commentError.message);
    } else {
      console.log('✅ Commentaires ajoutés');
    }
    
    // Créer des index pour les performances
    const { data: index, error: indexError } = await admin.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_quitus_dossier_id ON quitus(dossier_id);
        CREATE INDEX IF NOT EXISTS idx_quitus_statut ON quitus(statut);
        CREATE INDEX IF NOT EXISTS idx_quitus_genere_le ON quitus(genere_le);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_quitus_dossier_unique ON quitus(dossier_id);
      `
    });
    
    if (indexError) {
      console.warn('⚠️ Avertissement index:', indexError.message);
    } else {
      console.log('✅ Index créés');
    }
    
    // Créer des politiques RLS
    const { data: rls, error: rlsError } = await admin.rpc('exec_sql', {
      sql: `
        ALTER TABLE quitus ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Lecture des quitus par tous les utilisateurs connectés" ON quitus
            FOR SELECT USING (true);
        
        CREATE POLICY "Création des quitus par les AC" ON quitus
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid()::text 
                    AND users.role = 'AGENT_COMPTABLE'
                )
            );
        
        CREATE POLICY "Modification des quitus par les AC" ON quitus
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid()::text 
                    AND users.role = 'AGENT_COMPTABLE'
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

createQuitusTable();
