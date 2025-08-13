import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Ancienne base de données (locale)
const oldPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://8c9619ff9f940c56f88edf21a100ff75ddb82e0a1eb71e9407fe2dcc50ba44b9:sk_VsiEcdFteisepsHRcJUMw@db.prisma.io:5432/?sslmode=require'
    }
  }
})

// Nouvelle base de données Prisma Data Platform
const newPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://85ac3cefb1cfdf40c8a6405188632847e9f9d3b8196f64b3ef27df1923a492a7:sk_KxkJ0YzTBeugr0nvrYQto@db.prisma.io:5432/?sslmode=require'
    }
  }
})

async function migrateData() {
  try {
    console.log('🚀 Début de la migration vers la nouvelle base de données...')
    
    // 1. Récupérer les données de l'ancienne base
    console.log('📥 Récupération des données de l\'ancienne base...')
    const users = await oldPrisma.user.findMany()
    const folders = await oldPrisma.folder.findMany()
    const documents = await oldPrisma.document.findMany()
    const versions = await oldPrisma.documentVersion.findMany()
    
    console.log(`📊 Données récupérées : ${users.length} utilisateurs, ${folders.length} dossiers, ${documents.length} documents, ${versions.length} versions`)
    
    // 2. Vider la nouvelle base
    console.log('🧹 Nettoyage de la nouvelle base...')
    await newPrisma.documentVersion.deleteMany()
    await newPrisma.document.deleteMany()
    await newPrisma.folder.deleteMany()
    await newPrisma.user.deleteMany()
    
    // 3. Migrer les utilisateurs
    console.log('👥 Migration des utilisateurs...')
    for (const user of users) {
      await newPrisma.user.create({
        data: user
      })
    }
    console.log(`✅ ${users.length} utilisateurs migrés`)
    
    // 4. Migrer les dossiers
    console.log('📁 Migration des dossiers...')
    for (const folder of folders) {
      await newPrisma.folder.create({
        data: folder
      })
    }
    console.log(`✅ ${folders.length} dossiers migrés`)
    
    // 5. Migrer les documents (sans currentVersionId d'abord)
    console.log('📄 Migration des documents...')
    for (const document of documents) {
      const { currentVersionId, ...docWithoutVersion } = document
      await newPrisma.document.create({
        data: docWithoutVersion
      })
    }
    console.log(`✅ ${documents.length} documents migrés`)
    
    // 6. Migrer les versions
    console.log('📋 Migration des versions...')
    for (const version of versions) {
      await newPrisma.documentVersion.create({
        data: version
      })
    }
    console.log(`✅ ${versions.length} versions migrées`)
    
    // 7. Mettre à jour les versions courantes
    console.log('🔄 Mise à jour des versions courantes...')
    for (const document of documents) {
      if (document.currentVersionId) {
        await newPrisma.document.update({
          where: { id: document.id },
          data: { currentVersionId: document.currentVersionId }
        })
      }
    }
    console.log('✅ Versions courantes mises à jour')
    
    console.log('🎉 Migration terminée avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

migrateData()
