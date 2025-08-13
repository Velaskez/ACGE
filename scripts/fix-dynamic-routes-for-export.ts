import fs from 'fs'
import path from 'path'

async function fixDynamicRoutesForExport() {
  try {
    console.log('🔧 Correction des routes dynamiques pour l\'export statique...')

    const apiDir = path.join(process.cwd(), 'src', 'app', 'api')
    
    if (!fs.existsSync(apiDir)) {
      console.log('✅ Aucun dossier API trouvé')
      return
    }

    // Routes dynamiques qui nécessitent generateStaticParams
    const dynamicRoutes = [
      'src/app/api/documents/[id]/download/route.ts',
      'src/app/api/documents/[id]/route.ts',
      'src/app/api/documents/[id]/share/route.ts',
      'src/app/api/documents/versions/[versionId]/download/route.ts',
      'src/app/api/documents/versions/[versionId]/restore/route.ts',
      'src/app/api/folders/[id]/route.ts',
      'src/app/api/notifications/[id]/read/route.ts',
      'src/app/api/users/[id]/route.ts',
    ]

    for (const routePath of dynamicRoutes) {
      const fullPath = path.join(process.cwd(), routePath)
      
      if (fs.existsSync(fullPath)) {
        fixDynamicRoute(fullPath, routePath)
      }
    }

    console.log('\n✅ Correction des routes dynamiques terminée !')

  } catch (error) {
    console.error('❌ Erreur lors de la correction des routes dynamiques:', error)
  }
}

function fixDynamicRoute(filePath: string, routePath: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    
    // Vérifier si generateStaticParams existe déjà
    if (content.includes('generateStaticParams')) {
      console.log(`✅ Déjà corrigé : ${routePath}`)
      return
    }
    
    // Extraire le nom du paramètre dynamique
    const match = routePath.match(/\[([^\]]+)\]/)
    if (!match) {
      console.log(`⚠️ Pas de paramètre dynamique trouvé : ${routePath}`)
      return
    }
    
    const paramName = match[1]
    
    // Ajouter generateStaticParams après les exports existants
    const generateStaticParamsFunction = `

// Fonction requise pour l'export statique
export async function generateStaticParams() {
  return [
    { ${paramName}: '1' },
    { ${paramName}: '2' },
    { ${paramName}: '3' },
  ]
}
`
    
    // Ajouter à la fin du fichier
    content += generateStaticParamsFunction
    
    fs.writeFileSync(filePath, content)
    console.log(`✅ Corrigé : ${routePath}`)
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${routePath}:`, error)
  }
}

// Exécuter le script
fixDynamicRoutesForExport()
