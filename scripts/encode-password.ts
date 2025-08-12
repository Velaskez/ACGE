console.log('🔧 Encodage du mot de passe pour URL PostgreSQL')
console.log('')

const originalPassword = 'Reviti2025@'
const encodedPassword = encodeURIComponent(originalPassword)
const projectRef = 'wodyrsasfqfoqdydrfew'

console.log('📋 Mot de passe original:', originalPassword)
console.log('🔄 Mot de passe encodé:', encodedPassword)
console.log('')

const correctUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`

console.log('✅ URL complète correcte:')
console.log(correctUrl)
console.log('')
console.log('🎯 Exécuter:')
console.log('vercel env add DATABASE_URL production')
console.log('')
console.log('Puis coller cette URL:')
console.log(correctUrl)
