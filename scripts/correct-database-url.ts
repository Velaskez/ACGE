console.log('🔧 URL de base de données correcte pour Supabase:')
console.log('')

const projectRef = 'wodyrsasfqfoqdydrfew'
const password = 'Reviti2025@'
const correctUrl = `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`

console.log('📋 Format correct:')
console.log(correctUrl)
console.log('')
console.log('🎯 Commande à exécuter:')
console.log('vercel env add DATABASE_URL production')
console.log('')
console.log('Puis coller cette URL EXACTE (sans guillemets):')
console.log(correctUrl)
