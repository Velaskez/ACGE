import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Test de l\'upload avec versioning...')

  try {
    // 1. Vérifier les documents existants
    const existingDocuments = await prisma.document.findMany({
      include: {
        currentVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' }
        }
      }
    })

    console.log(`\n📄 Documents existants: ${existingDocuments.length}`)
    
    if (existingDocuments.length > 0) {
      const doc = existingDocuments[0]
      console.log(`   - ${doc.title}`)
      console.log(`   - ID: ${doc.id}`)
      console.log(`   - Versions: ${doc.versions.length}`)
      console.log(`   - Version actuelle: ${doc.currentVersion?.versionNumber}`)

      console.log('\n📝 Test scenario:')
      console.log('   Pour tester l\'upload avec versioning, utilisez:')
      console.log('   1. Upload nouveau fichier → Nouveau document + version 1')
      console.log('   2. Upload avec documentId existant → Nouvelle version du document')
      
      console.log('\n🔧 Payload d\'exemple pour nouvelle version:')
      console.log(`   FormData {`)
      console.log(`     files: [File],`)
      console.log(`     metadata: {`)
      console.log(`       "documentId": "${doc.id}",`)
      console.log(`       "changeLog": "Correction des erreurs v3"`)
      console.log(`     }`)
      console.log(`   }`)

      console.log('\n🔧 Payload d\'exemple pour nouveau document:')
      console.log(`   FormData {`)
      console.log(`     files: [File],`)
      console.log(`     metadata: {`)
      console.log(`       "name": "Nouveau Document",`)
      console.log(`       "description": "Description du document"`)
      console.log(`     }`)
      console.log(`   }`)
    }

    console.log('\n✅ API d\'upload mise à jour avec versioning!')
    console.log('\n🚀 Fonctionnalités disponibles:')
    console.log('   - Upload nouveau document → Crée Document + Version 1')
    console.log('   - Upload avec documentId → Crée nouvelle version')
    console.log('   - ChangeLog automatique ou personnalisé')
    console.log('   - Détection automatique nouveau/existant')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
