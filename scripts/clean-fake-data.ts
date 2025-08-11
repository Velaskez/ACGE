import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Suppression des fausses données de test...')

  try {
    // Trouver l'utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@acge.ga'
      }
    })

    if (!adminUser) {
      console.log('❌ Utilisateur admin non trouvé')
      return
    }

    console.log('✅ Utilisateur admin trouvé:', adminUser.email)

    // Lister d'abord les documents existants pour voir lesquels sont faux
    const allDocuments = await prisma.document.findMany({
      where: { authorId: adminUser.id },
      select: {
        id: true,
        title: true,
        fileName: true,
        filePath: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('\n📋 Documents actuels:')
    allDocuments.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.title || doc.fileName} (${doc.filePath})`)
    })

    // Supprimer tous les documents de test (ceux avec filePath contenant '/test/')
    const deletedDocuments = await prisma.document.deleteMany({
      where: {
        authorId: adminUser.id,
        filePath: {
          contains: '/test/'
        }
      }
    })

    console.log(`\n🗑️ Documents de test supprimés: ${deletedDocuments.count}`)

    // Supprimer tous les dossiers (qui sont probablement tous de test)
    const deletedFolders = await prisma.folder.deleteMany({
      where: {
        authorId: adminUser.id
      }
    })

    console.log(`🗑️ Dossiers supprimés: ${deletedFolders.count}`)

    // Vérifier ce qui reste
    const remainingDocuments = await prisma.document.count({
      where: { authorId: adminUser.id }
    })

    const remainingFolders = await prisma.folder.count({
      where: { authorId: adminUser.id }
    })

    console.log(`\n✅ Données restantes (réelles):`)
    console.log(`   - Documents: ${remainingDocuments}`)
    console.log(`   - Dossiers: ${remainingFolders}`)

    if (remainingDocuments > 0) {
      const realDocuments = await prisma.document.findMany({
        where: { authorId: adminUser.id },
        select: {
          title: true,
          fileName: true,
          filePath: true,
          fileSize: true
        }
      })

      console.log('\n📄 Documents réels restants:')
      realDocuments.forEach(doc => {
        const sizeKB = (doc.fileSize / 1024).toFixed(1)
        console.log(`   - ${doc.title || doc.fileName} (${sizeKB} KB) - ${doc.filePath}`)
      })
    }

    console.log('\n🎉 Nettoyage terminé! Seules les vraies données restent.')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    throw error
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
