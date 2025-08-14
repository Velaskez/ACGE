import * as fs from 'fs'
import * as path from 'path'

const apiDir = path.join(process.cwd(), 'src', 'app', 'api')

function cleanFile(filePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Supprimer tous les exports dynamiques et configurations
    const lines = content.split('\n')
    const cleanedLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Ignorer les lignes avec exports dynamiques
      if (line.includes('export const dynamic =')) continue
      if (line.includes('export const revalidate =')) continue
      if (line.includes('// Configuration pour')) continue
      if (line.includes('// Fonction requise pour')) continue
      if (line.includes('generateStaticParams')) continue
      
      cleanedLines.push(line)
    }
    
    // Rejoindre et nettoyer
    content = cleanedLines.join('\n')
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n')
    content = content.replace(/^\s*\n/, '') // Supprimer ligne vide au début
    
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

console.log('🔧 Nettoyage complet des routes...')
processDirectory(apiDir)
console.log('✅ Nettoyage terminé !')
