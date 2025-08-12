// Script pour unifier les secrets JWT et tester la cohérence

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const UNIFIED_SECRET = 'unified-jwt-secret-for-development'

console.log('🔧 Fixing JWT consistency...\n')

// 1. Créer un .env.local cohérent
const envLocalContent = `# JWT and Auth Configuration
NEXTAUTH_SECRET=${UNIFIED_SECRET}
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3003
NODE_ENV=development

# Application Settings
NEXT_PUBLIC_API_URL=http://localhost:3003
`

writeFileSync('.env.local', envLocalContent)
console.log('✅ Created unified .env.local')

// 2. Vérifier tous les fichiers qui utilisent JWT
const filesToCheck = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/dashboard/activity/route.ts',
  'src/app/api/sidebar/folders/route.ts'
]

for (const file of filesToCheck) {
  try {
    const content = readFileSync(file, 'utf8')
    if (content.includes('fallback-secret')) {
      const updatedContent = content.replace(
        /process\.env\.NEXTAUTH_SECRET \|\| 'fallback-secret'/g,
        `process.env.NEXTAUTH_SECRET || '${UNIFIED_SECRET}'`
      )
      writeFileSync(file, updatedContent)
      console.log(`✅ Updated ${file}`)
    }
  } catch (error) {
    console.log(`⚠️ Could not update ${file}:`, error)
  }
}

console.log('\n🚀 JWT consistency fixed!')
console.log('Please restart your Next.js server for changes to take effect.')
console.log('Run: npm run dev')
