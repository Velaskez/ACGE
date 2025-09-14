require('dotenv').config()

console.log('🔍 Test des variables d\'environnement:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...')
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...')
}
