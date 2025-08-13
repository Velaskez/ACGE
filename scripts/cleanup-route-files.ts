import fs from 'fs'
import path from 'path'

async function cleanupRouteFiles() {
  try {
    console.log('🧹 Nettoyage des fichiers de routes...')

    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    
    if (!fs.existsSync(apiDir)) {
      console.log('✅ Aucun dossier API trouvé')
      return
    }

    // Fonction récursive pour traiter tous les fichiers
    function processDirectory(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        
        if (entry.isDirectory()) {
          processDirectory(fullPath)
        } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
          cleanupRouteFile(fullPath)
        }
      }
    }

    function cleanupRouteFile(filePath: string) {
      try {
        let content = fs.readFileSync(filePath, 'utf8')
        
        // Supprimer les fonctions generateStaticParams mal placées
        const lines = content.split('\n')
        const cleanedLines = []
        let inGenerateStaticParams = false
        let braceCount = 0
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          
          if (line.includes('export async function generateStaticParams')) {
            inGenerateStaticParams = true
            continue
          }
          
          if (inGenerateStaticParams) {
            if (line.includes('{')) braceCount++
            if (line.includes('}')) {
              braceCount--
              if (braceCount === 0) {
                inGenerateStaticParams = false
                // Ajouter la fonction correctement à la fin
                cleanedLines.push('')
                cleanedLines.push('// Fonction requise pour l\'export statique')
                cleanedLines.push('export async function generateStaticParams() {')
                cleanedLines.push('  return [')
                cleanedLines.push('    { id: \'1\' },')
                cleanedLines.push('    { id: \'2\' },')
                cleanedLines.push('    { id: \'3\' },')
                cleanedLines.push('  ]')
                cleanedLines.push('}')
              }
            }
            continue
          }
          
          cleanedLines.push(line)
        }
        
        content = cleanedLines.join('\n')
        fs.writeFileSync(filePath, content)
        
        console.log(`✅ Nettoyé : ${path.relative(process.cwd(), filePath)}`)
        
      } catch (error) {
        console.error(`❌ Erreur lors du nettoyage de ${filePath}:`, error)
      }
    }

    processDirectory(apiDir)
    
    console.log('\n✅ Nettoyage des fichiers de routes terminé !')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  }
}

// Exécuter le script
cleanupRouteFiles()
