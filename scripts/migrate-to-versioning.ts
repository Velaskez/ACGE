import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migration vers le système de versioning...')

  try {
    // 1. Sauvegarder les documents existants
    console.log('\n📊 Analyse des données existantes...')
    
    const existingDocuments = await prisma.document.findMany({
      include: {
        author: true
      }
    })

    console.log(`Trouvé ${existingDocuments.length} document(s) à migrer`)

    if (existingDocuments.length === 0) {
      console.log('✅ Aucune donnée à migrer, la base est prête pour le versioning!')
      return
    }

    // 2. Afficher les documents existants
    console.log('\n📄 Documents à migrer:')
    existingDocuments.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.title || doc.fileName}`)
      console.log(`     - Taille: ${(doc.fileSize / 1024).toFixed(1)} KB`)
      console.log(`     - Auteur: ${doc.author.email}`)
      console.log(`     - Créé: ${doc.createdAt.toLocaleDateString('fr-FR')}`)
    })

    console.log('\n⚠️  ATTENTION: Cette migration va:')
    console.log('   1. Créer une DocumentVersion pour chaque Document existant')
    console.log('   2. Mettre à jour les références currentVersionId')
    console.log('   3. Les anciennes colonnes (fileName, fileSize, etc.) seront déplacées vers DocumentVersion')
    
    console.log('\n💡 La migration sera effectuée quand vous executerez "npm run db:push"')
    console.log('   Les données existantes seront préservées et converties automatiquement.')

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error)
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
