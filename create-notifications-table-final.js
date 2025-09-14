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
    console.log('🔧 Création de la table notifications...')
    
    // 1. Créer les types enum
    console.log('📋 1. Création des types enum...')
    
    const createTypesSQL = `
      -- Créer le type enum pour les types de notifications
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM (
          'INFO', 'WARNING', 'ERROR', 'SUCCESS', 'VALIDATION', 'REJECTION', 'APPROVAL', 'SYSTEM'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Créer le type enum pour les priorités
      DO $$ BEGIN
        CREATE TYPE notification_priority AS ENUM (
          'LOW', 'MEDIUM', 'HIGH', 'URGENT'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `
    
    const { error: typesError } = await supabase.rpc('exec_sql', { sql: createTypesSQL })
    
    if (typesError) {
      console.warn('⚠️ Erreur création types (peut-être déjà existants):', typesError.message)
    } else {
      console.log('✅ Types enum créés')
    }
    
    // 2. Créer la table notifications
    console.log('📋 2. Création de la table notifications...')
    
    const createTableSQL = `
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
    `
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    
    if (tableError) {
      console.warn('⚠️ Erreur création table (peut-être déjà existante):', tableError.message)
    } else {
      console.log('✅ Table notifications créée')
    }
    
    // 3. Activer RLS
    console.log('🔒 3. Activation de RLS...')
    
    const enableRLSSQL = `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL })
    
    if (rlsError) {
      console.warn('⚠️ Erreur activation RLS:', rlsError.message)
    } else {
      console.log('✅ RLS activé')
    }
    
    // 4. Créer les politiques RLS
    console.log('🛡️ 4. Création des politiques RLS...')
    
    const policiesSQL = `
      -- Politiques RLS
      -- Les utilisateurs peuvent voir leurs propres notifications
      DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
      CREATE POLICY "Users can view their own notifications" ON public.notifications
        FOR SELECT TO authenticated
        USING (auth.uid()::text = user_id);

      -- Les utilisateurs peuvent marquer leurs propres notifications comme lues
      DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
      CREATE POLICY "Users can update their own notifications" ON public.notifications
        FOR UPDATE TO authenticated
        USING (auth.uid()::text = user_id);

      -- Les admins peuvent insérer des notifications pour n'importe quel utilisateur
      DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
      CREATE POLICY "Admins can insert notifications" ON public.notifications
        FOR INSERT TO authenticated
        WITH CHECK (auth.jwt()->>'role' = 'ADMIN');

      -- Les admins peuvent supprimer n'importe quelle notification
      DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
      CREATE POLICY "Admins can delete notifications" ON public.notifications
        FOR DELETE TO authenticated
        USING (auth.jwt()->>'role' = 'ADMIN');
    `
    
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL })
    
    if (policiesError) {
      console.warn('⚠️ Erreur création politiques:', policiesError.message)
    } else {
      console.log('✅ Politiques RLS créées')
    }
    
    // 5. Créer les fonctions RPC
    console.log('⚙️ 5. Création des fonctions RPC...')
    
    const functionsSQL = `
      -- Créer des fonctions RPC pour la gestion des notifications
      CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id UUID)
      RETURNS VOID AS $$
      BEGIN
        UPDATE public.notifications
        SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
        WHERE id = notification_id AND user_id = auth.uid()::text;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      CREATE OR REPLACE FUNCTION public.mark_all_notifications_as_read(user_id_param TEXT)
      RETURNS INTEGER AS $$
      DECLARE
        updated_count INTEGER;
      BEGIN
        UPDATE public.notifications
        SET is_read = TRUE, read_at = NOW(), updated_at = NOW()
        WHERE user_id = user_id_param AND is_read = FALSE
        RETURNING 1 INTO updated_count;
        RETURN updated_count;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Fonction pour obtenir les statistiques de notifications d'un utilisateur
      CREATE OR REPLACE FUNCTION public.get_user_notification_stats(user_id_param TEXT)
      RETURNS TABLE (
        totalNotifications BIGINT,
        unreadCount BIGINT,
        highPriorityCount BIGINT,
        urgentCount BIGINT
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT
          COUNT(*)::BIGINT AS totalNotifications,
          COUNT(CASE WHEN NOT is_read THEN 1 END)::BIGINT AS unreadCount,
          COUNT(CASE WHEN priority = 'HIGH' AND NOT is_read THEN 1 END)::BIGINT AS highPriorityCount,
          COUNT(CASE WHEN priority = 'URGENT' AND NOT is_read THEN 1 END)::BIGINT AS urgentCount
        FROM public.notifications
        WHERE user_id = user_id_param AND (expires_at IS NULL OR expires_at > NOW());
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Grant permissions to the authenticated role for RPC functions
      GRANT EXECUTE ON FUNCTION public.mark_notification_as_read(UUID) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.mark_all_notifications_as_read(TEXT) TO authenticated;
      GRANT EXECUTE ON FUNCTION public.get_user_notification_stats(TEXT) TO authenticated;
    `
    
    const { error: functionsError } = await supabase.rpc('exec_sql', { sql: functionsSQL })
    
    if (functionsError) {
      console.warn('⚠️ Erreur création fonctions:', functionsError.message)
    } else {
      console.log('✅ Fonctions RPC créées')
    }
    
    // 6. Tester la table
    console.log('🧪 6. Test de la table...')
    
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur test table:', testError)
      return false
    }
    
    console.log('✅ Table notifications accessible')
    
    // 7. Créer une notification de test
    console.log('🔔 7. Création d\'une notification de test...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'SECRETAIRE')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur secrétaire trouvé')
      return false
    }
    
    const testNotification = {
      user_id: users[0].id,
      title: 'Test - Système de notifications activé',
      message: 'Le système de notifications intelligentes est maintenant opérationnel ! Vous recevrez des notifications pour tous les événements importants.',
      type: 'SUCCESS',
      priority: 'MEDIUM',
      action_url: '/secretaire-dashboard',
      action_label: 'Voir le dashboard'
    }
    
    const { data: insertedNotification, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select()
    
    if (insertError) {
      console.error('❌ Erreur création notification test:', insertError)
      return false
    }
    
    console.log('✅ Notification de test créée:', insertedNotification[0].id)
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la création
async function main() {
  console.log('🎯 Création de la table notifications')
  
  const success = await createNotificationsTable()
  
  if (success) {
    console.log('🎉 Table notifications créée avec succès!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Vous devriez voir la notification de test dans la sidebar')
    console.log('   3. Testez le rejet d\'un dossier depuis l\'interface CB')
    console.log('   4. Vérifiez que la notification apparaît dans l\'interface secrétaire')
  } else {
    console.log('❌ Échec de la création de la table notifications')
  }
}

main().catch(console.error)
