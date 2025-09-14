const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createNotificationsTable() {
  try {
    console.log('🚀 Création de la table notifications via API REST...')
    
    // Vérifier d'abord si la table existe déjà
    const { data: existingTable, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'notifications')
      .single()

    if (existingTable) {
      console.log('✅ Table notifications existe déjà!')
      return true
    }

    console.log('📄 Table notifications non trouvée, création en cours...')
    
    // Créer les types enum d'abord
    console.log('1️⃣ Création des types enum...')
    
    // Note: Les types enum doivent être créés via SQL direct
    // On va plutôt créer la table avec des types TEXT pour l'instant
    const { data: tableData, error: tableError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1)

    if (tableError && tableError.code === 'PGRST116') {
      console.log('📋 Table notifications non trouvée, création nécessaire')
      console.log('⚠️  La création de table nécessite l\'accès SQL direct')
      console.log('📝 Veuillez exécuter le SQL suivant dans votre console Supabase:')
      console.log('')
      console.log('-- SQL à exécuter dans Supabase SQL Editor:')
      console.log(`
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
  action_url TEXT,
  action_label TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Permissions
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO postgres;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can delete notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can delete notifications" ON public.notifications
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
      `)
      console.log('')
      console.log('📋 Après avoir exécuté ce SQL:')
      console.log('   1. Redémarrez l\'application')
      console.log('   2. Les notifications fonctionneront automatiquement')
      return false
    }

    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError)
      return false
    }

    console.log('✅ Table notifications existe déjà!')
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la création
async function main() {
  console.log('🎯 Vérification/Création de la table notifications')
  console.log('📍 URL Supabase:', supabaseUrl)
  
  const success = await createNotificationsTable()
  
  if (success) {
    console.log('🎉 Table notifications prête!')
  } else {
    console.log('📝 Suivez les instructions ci-dessus pour créer la table')
  }
}

main().catch(console.error)
