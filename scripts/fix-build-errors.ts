import * as fs from 'fs'
import * as path from 'path'

const apiDir = path.join(process.cwd(), 'src', 'app', 'api')

function cleanFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Supprimer les exports dynamiques et generateStaticParams
    content = content.replace(/\/\/ Configuration pour export statique\nexport const dynamic = 'force-static'\nexport const revalidate = false\n\n/g, '')
    content = content.replace(/\/\/ Fonction requise pour l'export statique\n\n\/\/ Fonction requise pour l'export statique\nexport async function generateStaticParams\(\) \{\n  return \[\n    \{ id: '1' \},\n    \{ id: '2' \},\n    \{ id: '3' \},\n  \]\n\}\n.*?\n\}/gs, '')
    content = content.replace(/export async function generateStaticParams\(\) \{\n  return \[\n    \{ id: '1' \},\n    \{ id: '2' \},\n    \{ id: '3' \},\n  \]\n\}\n.*?\n\}/gs, '')
    
    // Nettoyer les lignes vides multiples
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n')
    
    fs.writeFileSync(filePath, content)
    console.log(`✅ Nettoyé: ${filePath}`)
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error)
  }
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      processDirectory(filePath)
    } else if (file === 'route.ts') {
      cleanFile(filePath)
    }
  }
}

console.log('🔧 Nettoyage des erreurs de build...')
processDirectory(apiDir)
console.log('✅ Nettoyage terminé !')
