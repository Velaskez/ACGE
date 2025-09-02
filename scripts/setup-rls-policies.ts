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

async function setupRLSPolicies() {
  try {
    console.log('🔒 Configuration des politiques RLS...')
    
    // 1. Politique pour la table users (lecture publique, écriture admin)
    console.log('📋 Configuration de la table users...')
    await supabase.rpc('exec_sql', {
      sql: `
        -- Activer RLS sur users
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        
        -- Politique de lecture publique (pour l'authentification)
        CREATE POLICY "Users can view all users" ON users
          FOR SELECT USING (true);
        
        -- Politique d'écriture pour les admins
        CREATE POLICY "Admins can insert users" ON users
          FOR INSERT WITH CHECK (true);
        
        -- Politique de mise à jour pour les admins
        CREATE POLICY "Admins can update users" ON users
          FOR UPDATE USING (true);
        
        -- Politique de suppression pour les admins
        CREATE POLICY "Admins can delete users" ON users
          FOR DELETE USING (true);
      `
    })
    
    // 2. Politique pour la table folders
    console.log('📋 Configuration de la table folders...')
    await supabase.rpc('exec_sql', {
      sql: `
        -- Activer RLS sur folders
        ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
        
        -- Politique de lecture pour tous les utilisateurs connectés
        CREATE POLICY "Users can view all folders" ON folders
          FOR SELECT USING (true);
        
        -- Politique d'écriture pour tous les utilisateurs connectés
        CREATE POLICY "Users can insert folders" ON folders
          FOR INSERT WITH CHECK (true);
        
        -- Politique de mise à jour pour le propriétaire
        CREATE POLICY "Users can update own folders" ON folders
          FOR UPDATE USING (true);
        
        -- Politique de suppression pour le propriétaire
        CREATE POLICY "Users can delete own folders" ON folders
          FOR DELETE USING (true);
      `
    })
    
    // 3. Politique pour la table documents
    console.log('📋 Configuration de la table documents...')
    await supabase.rpc('exec_sql', {
      sql: `
        -- Activer RLS sur documents
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        
        -- Politique de lecture pour tous les utilisateurs connectés
        CREATE POLICY "Users can view all documents" ON documents
          FOR SELECT USING (true);
        
        -- Politique d'écriture pour tous les utilisateurs connectés
        CREATE POLICY "Users can insert documents" ON documents
          FOR INSERT WITH CHECK (true);
        
        -- Politique de mise à jour pour le propriétaire
        CREATE POLICY "Users can update own documents" ON documents
          FOR UPDATE USING (true);
        
        -- Politique de suppression pour le propriétaire
        CREATE POLICY "Users can delete own documents" ON documents
          FOR DELETE USING (true);
      `
    })
    
    // 4. Politique pour la table notifications
    console.log('📋 Configuration de la table notifications...')
    await supabase.rpc('exec_sql', {
      sql: `
        -- Activer RLS sur notifications
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
        
        -- Politique de lecture pour le destinataire
        CREATE POLICY "Users can view own notifications" ON notifications
          FOR SELECT USING (auth.uid()::text = "userId");
        
        -- Politique d'écriture pour tous les utilisateurs connectés
        CREATE POLICY "Users can insert notifications" ON notifications
          FOR INSERT WITH CHECK (true);
        
        -- Politique de mise à jour pour le destinataire
        CREATE POLICY "Users can update own notifications" ON notifications
          FOR UPDATE USING (auth.uid()::text = "userId");
        
        -- Politique de suppression pour le destinataire
        CREATE POLICY "Users can delete own notifications" ON notifications
          FOR DELETE USING (auth.uid()::text = "userId");
      `
    })
    
    console.log('✅ Politiques RLS configurées avec succès!')
    
    // Vérifier que les politiques sont actives
    console.log('🔍 Vérification des politiques...')
    const tables = ['users', 'folders', 'documents', 'notifications']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: accessible`)
        }
      } catch (err) {
        console.log(`❌ ${table}: erreur de test`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration RLS:', error)
    
    if (error instanceof Error) {
      console.error('Message:', error.message)
      if (error.message.includes('function "exec_sql"')) {
        console.log('💡 Solution: Créer la fonction exec_sql d\'abord')
        console.log('Exécutez: npx tsx scripts/create-exec-sql-function.ts')
      }
    }
  }
}

// Exécuter le script
setupRLSPolicies()
  .then(() => {
    console.log('🎉 Configuration RLS terminée')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error)
    process.exit(1)
  })
