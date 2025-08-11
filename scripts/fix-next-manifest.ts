/**
 * Génère un fichier .next/routes-manifest.json minimal pour éviter l'erreur ENOENT
 * déclenchée par le runtime Pages en dev avec Next 15 lorsqu'il charge /_error.
 */
import fs from 'fs'
import path from 'path'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function main() {
  const nextDir = path.join(process.cwd(), '.next')
  ensureDir(nextDir)

  const manifestPath = path.join(nextDir, 'routes-manifest.json')
  const minimalManifest = {
    version: 5,
    basePath: '',
    pages404: true,
    caseSensitive: false,
    redirects: [],
    headers: [],
    rewrites: {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    },
    staticRoutes: [],
    dynamicRoutes: [],
    dataRoutes: [],
    rsc: true,
  }

  try {
    fs.writeFileSync(manifestPath, JSON.stringify(minimalManifest, null, 2), 'utf8')
    console.log(`Écrit: ${manifestPath}`)
  } catch (e) {
    console.error('Impossible d’écrire le manifest:', (e as Error).message)
    process.exit(1)
  }
}

main()


