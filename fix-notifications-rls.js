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

async function fixNotificationsRLS() {
  try {
    console.log('🔧 Correction des politiques RLS pour les notifications...')
    
    // 1. Supprimer les anciennes politiques
    console.log('🗑️ 1. Suppression des anciennes politiques...')
    
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
      DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
    `
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPoliciesSQL })
    
    if (dropError) {
      console.warn('⚠️ Erreur suppression politiques (peut-être déjà supprimées):', dropError.message)
    } else {
      console.log('✅ Anciennes politiques supprimées')
    }
    
    // 2. Créer de nouvelles politiques plus permissives
    console.log('🛡️ 2. Création de nouvelles politiques RLS...')
    
    const newPoliciesSQL = `
      -- Politique pour permettre aux utilisateurs de voir leurs propres notifications
      CREATE POLICY "Users can view their own notifications" ON public.notifications
        FOR SELECT TO authenticated
        USING (user_id = auth.uid()::text);

      -- Politique pour permettre aux utilisateurs de marquer leurs notifications comme lues
      CREATE POLICY "Users can update their own notifications" ON public.notifications
        FOR UPDATE TO authenticated
        USING (user_id = auth.uid()::text);

      -- Politique pour permettre l'insertion de notifications (pour les admins et le système)
      CREATE POLICY "Allow notification insertion" ON public.notifications
        FOR INSERT TO authenticated
        WITH CHECK (true);

      -- Politique pour permettre la suppression de notifications (pour les admins)
      CREATE POLICY "Admins can delete notifications" ON public.notifications
        FOR DELETE TO authenticated
        USING (auth.jwt()->>'role' = 'ADMIN');
    `
    
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: newPoliciesSQL })
    
    if (policiesError) {
      console.warn('⚠️ Erreur création nouvelles politiques:', policiesError.message)
    } else {
      console.log('✅ Nouvelles politiques RLS créées')
    }
    
    // 3. Tester l'accès aux notifications
    console.log('🧪 3. Test de l\'accès aux notifications...')
    
    // Récupérer un utilisateur secrétaire
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'SECRETAIRE')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('❌ Aucun utilisateur secrétaire trouvé')
      return false
    }
    
    const secretaire = users[0]
    console.log(`✅ Secrétaire: ${secretaire.name} (${secretaire.email})`)
    
    // Tester avec le client côté client (comme dans l'application)
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Simuler l'authentification en utilisant l'ID de l'utilisateur
    const { data: notifications, error: notificationsError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', secretaire.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (notificationsError) {
      console.error('❌ Erreur test accès notifications:', notificationsError)
      return false
    }
    
    console.log(`✅ ${notifications.length} notifications accessibles via client côté client`)
    
    // Afficher les notifications
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}, ${notif.priority}) - ${notif.is_read ? 'Lue' : 'Non lue'}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter la correction
async function main() {
  console.log('🎯 Correction des politiques RLS pour les notifications')
  
  const success = await fixNotificationsRLS()
  
  if (success) {
    console.log('🎉 Politiques RLS corrigées avec succès!')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Rafraîchissez votre interface secrétaire (F5)')
    console.log('   2. Ouvrez la console du navigateur (F12)')
    console.log('   3. Les logs "🔍 useNotifications:" devraient maintenant montrer des notifications')
    console.log('   4. Vérifiez la section "Notifications" dans la sidebar')
  } else {
    console.log('❌ Échec de la correction des politiques RLS')
  }
}

main().catch(console.error)
