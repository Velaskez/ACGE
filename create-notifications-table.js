const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createNotificationsTable() {
  try {
    console.log('🚀 Création de la table notifications...')
    
    // SQL pour créer la table notifications
    const createTableSQL = `
      -- Créer le type enum pour les types de notifications
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM (
          'INFO',           -- Information générale
          'WARNING',        -- Avertissement
          'ERROR',          -- Erreur
          'SUCCESS',        -- Succès
          'VALIDATION',     -- Demande de validation
          'REJECTION',      -- Rejet de dossier
          'APPROVAL',       -- Approbation de dossier
          'SYSTEM'          -- Notification système
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Créer le type enum pour les priorités
      DO $$ BEGIN
        CREATE TYPE notification_priority AS ENUM (
          'LOW',            -- Priorité faible
          'MEDIUM',         -- Priorité moyenne
          'HIGH',           -- Priorité élevée
          'URGENT'          -- Priorité urgente
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Créer la table notifications
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type notification_type NOT NULL DEFAULT 'INFO',
        priority notification_priority NOT NULL DEFAULT 'MEDIUM',
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        read_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        action_url TEXT, -- URL vers la page concernée
        action_label TEXT, -- Label du bouton d'action
        metadata JSONB, -- Données supplémentaires (ex: dossier_id, document_id)
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );

      -- Créer les index pour les performances
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
      CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

      -- Créer un index composite pour les requêtes fréquentes
      CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

      -- Permettre l'accès à la table pour le service role
      GRANT ALL ON public.notifications TO service_role;
      GRANT ALL ON public.notifications TO postgres;

      -- Activer RLS
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

      -- Supprimer les politiques existantes si elles existent
      DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Service role can delete notifications" ON public.notifications;

      -- Politique RLS : les utilisateurs peuvent voir leurs propres notifications
      CREATE POLICY "Users can view their own notifications" ON public.notifications
        FOR SELECT USING (auth.jwt()->>'sub' = user_id);

      -- Politique RLS : les utilisateurs peuvent marquer leurs notifications comme lues
      CREATE POLICY "Users can update their own notifications" ON public.notifications
        FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

      -- Politique RLS : le service role peut insérer des notifications
      CREATE POLICY "Service role can insert notifications" ON public.notifications
        FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

      -- Politique RLS : le service role peut supprimer des notifications
      CREATE POLICY "Service role can delete notifications" ON public.notifications
        FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
    `

    // Exécuter le SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (error) {
      console.error('❌ Erreur lors de la création de la table:', error)
      return false
    }
    
    console.log('✅ Table notifications créée avec succès!')
    
    // Vérifier que la table a été créée
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
    
    if (tablesError) {
      console.error('❌ Erreur lors de la vérification de la table:', tablesError)
      return false
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Table notifications vérifiée avec succès!')
    } else {
      console.log('⚠️  Table notifications non trouvée après création')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la création
async function main() {
  console.log('🎯 Création de la table notifications')
  console.log('📍 URL Supabase:', supabaseUrl)
  
  const success = await createNotificationsTable()
  
  if (success) {
    console.log('🎉 Table notifications créée avec succès!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Redémarrer l\'application')
    console.log('   2. Tester les notifications dans la sidebar')
    console.log('   3. Vérifier la page /notifications')
  } else {
    console.log('💥 Échec de la création de la table')
    console.log('📞 Contactez le support technique si le problème persiste')
  }
}

main().catch(console.error)
