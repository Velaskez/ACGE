import { PrismaClient } from '@prisma/client'

// Utilisera l'ancien schema temporairement
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migration sécurisée vers le versioning...')

  try {
    // 1. Backup des données existantes
    console.log('\n📋 Sauvegarde des documents existants...')
    
    const existingDocuments = await prisma.$queryRaw<Array<{
      id: string;
      title: string;
      description: string | null;
      fileName: string;
      fileSize: number;
      fileType: string;
      filePath: string;
      version: number;
      isPublic: boolean;
      createdAt: Date;
      updatedAt: Date;
      authorId: string;
      folderId: string | null;
    }>>`
      SELECT id, title, description, "fileName", "fileSize", "fileType", "filePath", 
             version, "isPublic", "createdAt", "updatedAt", "authorId", "folderId"
      FROM documents
    `

    console.log(`✅ Sauvegardé ${existingDocuments.length} document(s)`)
    
    if (existingDocuments.length > 0) {
      console.log('\n📄 Documents à migrer:')
      existingDocuments.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.title} (${doc.fileName})`)
      })
    }

    // 2. Sauvegarder en JSON pour sécurité
    const fs = require('fs')
    const backupData = {
      timestamp: new Date().toISOString(),
      documents: existingDocuments
    }
    
    fs.writeFileSync('backup-documents-before-versioning.json', JSON.stringify(backupData, null, 2))
    console.log('\n💾 Backup créé: backup-documents-before-versioning.json')

    console.log('\n✅ Migration préparée! Étapes suivantes:')
    console.log('  1. Backup créé ✅')
    console.log('  2. Exécutez: npx prisma db push --accept-data-loss')
    console.log('  3. Exécutez: npm run restore:documents')
    console.log('\n⚠️  Note: Les données seront restaurées automatiquement après le push!')

  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error)
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
