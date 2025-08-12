// URL avec le pooler Supabase (plus fiable pour les connexions externes)
const projectRef = 'wodyrsasfqfoqdydrfew'
const password = 'Reviti2025@'
const encodedPassword = encodeURIComponent(password)

// URL avec pooler (port 6543 au lieu de 5432)
const poolerUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:6543/postgres`

console.log('🔄 URL avec Pooler Supabase (plus fiable):')
console.log('')
console.log(poolerUrl)
console.log('')
console.log('📋 Différences:')
console.log('- Host: aws-0-eu-west-3.pooler.supabase.com (au lieu de db.PROJECT.supabase.co)')
console.log('- Port: 6543 (au lieu de 5432)')
console.log('- Optimisé pour les connexions externes/serverless')
console.log('')
console.log('🔧 Commande:')
console.log('vercel env add DATABASE_URL production')
console.log('(puis coller l\'URL ci-dessus)')
