import * as fs from 'fs'
import * as path from 'path'

const apiDir = path.join(process.cwd(), 'src', 'app', 'api')

function cleanFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Supprimer les exports dynamiques
    content = content.replace(/export const dynamic = ['"]force-dynamic['"]\n/g, '')
    content = content.replace(/export const dynamic = ['"]force-static['"]\n/g, '')
    content = content.replace(/export const revalidate = false\n/g, '')
    content = content.replace(/export const revalidate = \d+\n/g, '')
    
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

console.log('🔧 Suppression des exports dynamiques...')
processDirectory(apiDir)
console.log('✅ Nettoyage terminé !')
