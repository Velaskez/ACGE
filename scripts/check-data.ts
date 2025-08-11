import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Vérification des données en base...\n')

  try {
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log(`👤 Utilisateurs: ${userCount}`)

    // Compter les documents par utilisateur
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            documents: true,
            folders: true
          }
        }
      }
    })

    users.forEach(user => {
      console.log(`  - ${user.email}: ${user._count.documents} documents, ${user._count.folders} dossiers`)
    })

    // Compter le total
    const totalDocuments = await prisma.document.count()
    const totalFolders = await prisma.folder.count()
    
    console.log(`\n📁 Total documents: ${totalDocuments}`)
    console.log(`🗂️ Total dossiers: ${totalFolders}`)

    // Calculer l'espace utilisé (depuis les versions de documents)
    const spaceUsed = await prisma.documentVersion.aggregate({
      _sum: {
        fileSize: true
      }
    })

    const totalBytes = spaceUsed._sum.fileSize || 0
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
    console.log(`💾 Espace utilisé: ${totalGB} GB (${totalBytes} bytes)`)

    // Lister les dossiers récents
    console.log('\n📂 Dossiers récents:')
    const recentFolders = await prisma.folder.findMany({
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })

    recentFolders.forEach(folder => {
      console.log(`  - ${folder.name} (${folder._count.documents} documents)`)
    })

    console.log('\n✅ Vérification terminée!')

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
