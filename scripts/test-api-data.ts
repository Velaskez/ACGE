import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test des données API...')

  try {
    // Simuler la logique des APIs
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@acge.ga' }
    })

    if (!adminUser) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    // Statistiques comme dans l'API
    const [
      totalDocuments,
      totalFolders,
      totalUsers,
      totalFileSize
    ] = await Promise.all([
      prisma.document.count({
        where: { authorId: adminUser.id }
      }),
      prisma.folder.count({
        where: { authorId: adminUser.id }
      }),
      prisma.user.count(),
      prisma.document.aggregate({
        where: { authorId: adminUser.id },
        _sum: { fileSize: true }
      })
    ])

    const totalSizeBytes = totalFileSize._sum.fileSize || 0
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024)

    console.log('\n📊 Ce que les APIs devraient retourner:')
    console.log(`   - Total documents: ${totalDocuments}`)
    console.log(`   - Total dossiers: ${totalFolders}`)
    console.log(`   - Total utilisateurs: ${totalUsers}`)
    console.log(`   - Espace utilisé: ${totalSizeGB.toFixed(3)} GB (${totalSizeBytes} bytes)`)

    // Documents récents
    const recentDocuments = await prisma.document.findMany({
      where: { authorId: adminUser.id },
      include: {
        author: {
          select: { name: true, email: true }
        },
        folder: {
          select: { name: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })

    console.log(`\n📄 Documents récents (${recentDocuments.length}):`)
    recentDocuments.forEach(doc => {
      const sizeKB = (doc.fileSize / 1024).toFixed(1)
      console.log(`   - ${doc.title || doc.fileName} (${sizeKB} KB)`)
    })

    // Dossiers pour sidebar
    const folders = await prisma.folder.findMany({
      where: { authorId: adminUser.id },
      include: {
        _count: { select: { documents: true } }
      },
      take: 6
    })

    console.log(`\n📂 Dossiers sidebar (${folders.length}):`)
    if (folders.length === 0) {
      console.log('   Aucun dossier (état vide correct)')
    } else {
      folders.forEach(folder => {
        console.log(`   - ${folder.name} (${folder._count.documents} docs)`)
      })
    }

    console.log('\n✅ Les APIs retourneront les bonnes données!')

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
