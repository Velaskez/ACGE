import fs from 'fs'
import path from 'path'

async function fixAPIRoutesForExport() {
  try {
    console.log('🔧 Correction des routes API pour l\'export statique...')

    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    
    if (!fs.existsSync(apiDir)) {
      console.log('✅ Aucun dossier API trouvé, pas de correction nécessaire')
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
          fixRouteFile(fullPath)
        }
      }
    }

    function fixRouteFile(filePath: string) {
      try {
        let content = fs.readFileSync(filePath, 'utf8')
        
        // Vérifier si le fichier contient déjà les exports nécessaires
        if (content.includes('export const dynamic') || content.includes('export const revalidate')) {
          return
        }
        
        // Ajouter les exports au début du fichier
        const exportsToAdd = `// Configuration pour export statique
export const dynamic = 'force-static'
export const revalidate = false

`
        
        content = exportsToAdd + content
        fs.writeFileSync(filePath, content)
        
        console.log(`✅ Corrigé : ${path.relative(process.cwd(), filePath)}`)
      } catch (error) {
        console.error(`❌ Erreur lors de la correction de ${filePath}:`, error)
      }
    }

    processDirectory(apiDir)
    
    console.log('\n✅ Correction des routes API terminée !')
    console.log('📋 Les routes API sont maintenant compatibles avec l\'export statique')

  } catch (error) {
    console.error('❌ Erreur lors de la correction des routes API:', error)
  }
}

// Exécuter le script
fixAPIRoutesForExport()
