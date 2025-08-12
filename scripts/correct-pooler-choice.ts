console.log('🎯 Choix du bon pooler Supabase pour Vercel')
console.log('')
console.log('📋 Deux options disponibles:')
console.log('')
console.log('1️⃣ POOLER DE TRANSACTIONS (RECOMMANDÉ pour Vercel):')
console.log('   - Idéal pour les applications sans état')
console.log('   - Fonctions sans serveur')
console.log('   - Chaque interaction avec Postgres est brève et isolée')
console.log('   ✅ PARFAIT POUR VERCEL/SERVERLESS')
console.log('')
console.log('2️⃣ Pooler de session:')
console.log('   - Pour connexions persistantes')
console.log('   - Applications avec état')
console.log('   ❌ Pas adapté pour Vercel')
console.log('')
console.log('🔧 URL à utiliser (Pooler de transactions):')

const projectRef = 'wodyrsasfqfoqdydrfew'
const password = 'Reviti2025@'
const encodedPassword = encodeURIComponent(password)

// URL du pooler de transactions
const transactionPoolerUrl = `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-eu-west-3.pooler.supabase.com:5432/postgres`

console.log(transactionPoolerUrl)
console.log('')
console.log('📝 Dans votre screenshot, c\'est celui qui dit:')
console.log('"Idéal pour les applications sans état comme les fonctions sans serveur"')
