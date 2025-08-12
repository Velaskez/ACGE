// URL DATABASE_URL correcte pour Supabase
const projectRef = 'wodyrsasfqfoqdydrfew'
const password = 'Reviti2025@'
const encodedPassword = encodeURIComponent(password) // Encode le @ en %40

const finalUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`

console.log('🎯 URL EXACTE à copier-coller:')
console.log('')
console.log(finalUrl)
console.log('')
console.log('📋 Détails:')
console.log(`- Project: ${projectRef}`)
console.log(`- Password original: ${password}`)
console.log(`- Password encodé: ${encodedPassword}`)
console.log('')
console.log('🔧 Commande:')
console.log('vercel env add DATABASE_URL production')
console.log('(puis coller l\'URL ci-dessus)')
