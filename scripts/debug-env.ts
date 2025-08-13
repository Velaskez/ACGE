import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

console.log('🔍 Debug des variables d\'environnement...')
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Présent' : '❌ Manquant')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Présent' : '❌ Manquant')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Présent' : '❌ Manquant')

if (process.env.BLOB_READ_WRITE_TOKEN) {
  console.log('Token Vercel Blob:', process.env.BLOB_READ_WRITE_TOKEN.substring(0, 20) + '...')
}
