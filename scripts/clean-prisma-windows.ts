/**
 * Script de nettoyage Prisma pour Windows.
 *
 * Corrige l'erreur EPERM lors du renommage du binaire Prisma (.dll) en supprimant
 * les fichiers verrouillés dans node_modules/.prisma et en régénérant le client.
 */
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

function safeUnlink(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`Supprimé: ${filePath}`)
    }
  } catch (e) {
    console.warn(`Impossible de supprimer ${filePath}:`, (e as Error).message)
  }
}

function removeIfExists(targetPath: string) {
  try {
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true })
      console.log(`Supprimé: ${targetPath}`)
    }
  } catch (e) {
    console.warn(`Impossible de supprimer ${targetPath}:`, (e as Error).message)
  }
}

function main() {
  const prismaDir = path.join(process.cwd(), 'node_modules', '.prisma')
  const clientDir = path.join(prismaDir, 'client')

  // Fichiers binaires potentiels à nettoyer
  const candidates = [
    path.join(clientDir, 'query_engine-windows.dll.node'),
    path.join(clientDir, 'query_engine-windows.dll.node.lock'),
    path.join(clientDir, 'libquery_engine-windows.dll.node'),
  ]

  for (const candidate of candidates) {
    safeUnlink(candidate)
  }

  // Nettoyage plus large du dossier client .prisma
  removeIfExists(clientDir)

  // Réinstaller le client Prisma
  console.log('Régénération Prisma...')
  try {
    execSync('npx --yes prisma generate', { stdio: 'inherit' })
  } catch (e) {
    console.error('Echec prisma generate. Réessayer après fermeture des processus Node utilisant Prisma (ex: dev server).')
    process.exit(1)
  }

  console.log('Nettoyage Prisma terminé.')
}

main()


