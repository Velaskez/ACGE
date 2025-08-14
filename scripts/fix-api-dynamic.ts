import fs from 'fs'
import path from 'path'

console.log('🔧 Correction des APIs dynamiques...')

// APIs importantes à corriger
const importantApis = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/documents/route.ts',
  'src/app/api/folders/route.ts',
  'src/app/api/upload/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/notifications/route.ts',
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/dashboard/activity/route.ts',
  'src/app/api/profile/route.ts'
]

function fixApiFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé : ${filePath}`)
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')
    
    // Remplacer force-static par force-dynamic
    const fixedContent = content.replace(
      /export const dynamic = 'force-static'/g,
      "export const dynamic = 'force-dynamic'"
    ).replace(
      /export const revalidate = false/g,
      ''
    )

    if (content !== fixedContent) {
      fs.writeFileSync(filePath, fixedContent)
      console.log(`✅ Corrigé : ${filePath}`)
    } else {
      console.log(`ℹ️  Déjà correct : ${filePath}`)
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error)
  }
}

// Corriger les APIs importantes
importantApis.forEach(api => {
  fixApiFile(api)
})

console.log('\n🎉 Correction des APIs terminée !')
console.log('🔄 Redémarrez l\'application pour appliquer les changements')
