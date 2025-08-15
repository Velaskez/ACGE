import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Vérification des variables d'environnement
console.log('🔍 Configuration Supabase:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables Supabase manquantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  throw new Error('Variables d\'environnement Supabase manquantes')
}

// Client public
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client admin pour les opérations côté serveur
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Vérification de la configuration
if (!supabaseAdmin) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY manquante - Uploads non disponibles')
}
