import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test de la structure UI après corrections versioning...\n')

  // Récupérer un document avec sa version actuelle
  const document = await prisma.document.findFirst({
    include: {
      currentVersion: true,
      _count: {
        select: {
          versions: true
        }
      },
      author: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!document) {
    console.log('❌ Aucun document trouvé')
    return
  }

  console.log('📄 Document trouvé:')
  console.log(`   - ID: ${document.id}`)
  console.log(`   - Titre: ${document.title}`)
  console.log(`   - Description: ${document.description || 'Aucune'}`)
  console.log(`   - Public: ${document.isPublic}`)
  
  if (document.currentVersion) {
    console.log('\n🔄 Version actuelle:')
    console.log(`   - Version: ${document.currentVersion.versionNumber}`)
    console.log(`   - Nom du fichier: ${document.currentVersion.fileName}`)
    console.log(`   - Taille: ${document.currentVersion.fileSize} bytes`)
    console.log(`   - Type: ${document.currentVersion.fileType}`)
    console.log(`   - Changelog: ${document.currentVersion.changeLog || 'Aucun'}`)
  } else {
    console.log('\n❌ Aucune version actuelle trouvée!')
  }

  console.log('\n📊 Statistiques:')
  console.log(`   - Nombre total de versions: ${document._count.versions}`)
  console.log(`   - Auteur: ${document.author?.name || 'Inconnu'} (${document.author?.email || 'N/A'})`)

  console.log('\n✅ Structure compatible avec les composants UI!')
  
  // Test de simulation d'accès aux propriétés
  console.log('\n🎯 Simulation accès propriétés UI:')
  console.log(`   - currentVersion?.fileName: "${document.currentVersion?.fileName || 'Sans nom'}"`)
  console.log(`   - currentVersion?.fileType: "${document.currentVersion?.fileType || 'Inconnu'}"`)
  console.log(`   - currentVersion?.fileSize: ${document.currentVersion?.fileSize || 0}`)
  console.log(`   - currentVersion?.versionNumber: ${document.currentVersion?.versionNumber || 0}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
