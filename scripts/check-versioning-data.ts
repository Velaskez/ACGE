import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Vérification des données versioning...\n')

  try {
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log(`👤 Utilisateurs: ${userCount}`)

    // Compter les documents et versions
    const documentCount = await prisma.document.count()
    const versionCount = await prisma.documentVersion.count()
    const folderCount = await prisma.folder.count()
    
    console.log(`📁 Documents: ${documentCount}`)
    console.log(`🔄 Versions totales: ${versionCount}`)
    console.log(`🗂️ Dossiers: ${folderCount}`)

    // Détails des documents avec leurs versions
    const documentsWithVersions = await prisma.document.findMany({
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' }
        },
        author: {
          select: { email: true, name: true }
        }
      }
    })

    console.log('\n📄 Documents avec versioning:')
    documentsWithVersions.forEach(doc => {
      console.log(`\n  📋 ${doc.title}`)
      console.log(`     - Auteur: ${doc.author.email}`)
      console.log(`     - Versions: ${doc.versions.length}`)
      console.log(`     - Version actuelle: ${doc.currentVersion?.versionNumber || 'Aucune'}`)
      
      if (doc.versions.length > 0) {
        console.log(`     - Historique:`)
        doc.versions.forEach(version => {
          const sizeMB = (version.fileSize / (1024 * 1024)).toFixed(2)
          const isCurrent = version.id === doc.currentVersionId ? ' (ACTUELLE)' : ''
          console.log(`       v${version.versionNumber}: ${version.fileName} (${sizeMB} MB)${isCurrent}`)
        })
      }
    })

    // Calculer l'espace total utilisé
    const totalSpace = await prisma.documentVersion.aggregate({
      _sum: {
        fileSize: true
      }
    })

    const totalGB = (totalSpace._sum.fileSize || 0) / (1024 * 1024 * 1024)
    console.log(`\n💾 Espace total utilisé: ${totalGB.toFixed(3)} GB`)

    console.log('\n✅ Système de versioning opérationnel!')

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
