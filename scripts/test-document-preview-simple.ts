#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'

async function testDocumentPreviewSimple() {
  console.log('🔍 Test diagnostic aperçu documents (sans Supabase)')
  console.log('==================================================')
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣ Test connexion base de données...')
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // 2. Récupérer tous les documents
    console.log('\n2️⃣ Récupération des documents...')
    const documents = await prisma.document.findMany({
      include: {
        currentVersion: true,
        author: true
      }
    })
    
    console.log(`📄 ${documents.length} document(s) trouvé(s)`)
    
    if (documents.length === 0) {
      console.log('⚠️ Aucun document à tester')
      return
    }
    
    // 3. Analyser chaque document
    console.log('\n3️⃣ Analyse des documents...')
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      console.log(`\n📄 Document ${i + 1}/${documents.length}: ${doc.title}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Auteur: ${doc.author?.name || 'N/A'} (ID: ${doc.authorId})`)
      
      if (!doc.currentVersion) {
        console.log('   ❌ Aucune version actuelle')
        continue
      }
      
      console.log(`   📁 Fichier: ${doc.currentVersion.fileName}`)
      console.log(`   📂 Chemin: ${doc.currentVersion.filePath}`)
      console.log(`   📊 Taille: ${doc.currentVersion.fileSize} bytes`)
      console.log(`   🏷️ Type: ${doc.currentVersion.fileType}`)
      
      // Analyser le chemin du fichier
      const filePath = doc.currentVersion.filePath
      if (!filePath) {
        console.log('   ❌ Chemin de fichier manquant')
        continue
      }
      
      if (filePath.includes('supabase.co')) {
        console.log('   🔗 URL Supabase détectée')
        const urlParts = filePath.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const userIdFromPath = urlParts[urlParts.length - 2]
        console.log(`   📝 Nom fichier extrait: ${fileName}`)
        console.log(`   👤 User ID extrait: ${userIdFromPath}`)
        console.log(`   🔧 Chemin relatif: ${userIdFromPath}/${fileName}`)
      } else if (filePath.includes('/')) {
        console.log('   📁 Chemin relatif détecté')
        const pathParts = filePath.split('/')
        console.log(`   📝 Nom fichier: ${pathParts[pathParts.length - 1]}`)
        console.log(`   📂 Dossier: ${pathParts.slice(0, -1).join('/')}`)
      } else {
        console.log('   📄 Nom de fichier simple')
      }
    }
    
    // 4. Vérifier les problèmes potentiels
    console.log('\n4️⃣ Diagnostic des problèmes...')
    
    const problems = []
    
    // Documents sans version
    const docsWithoutVersion = documents.filter(d => !d.currentVersion)
    if (docsWithoutVersion.length > 0) {
      problems.push(`${docsWithoutVersion.length} document(s) sans version actuelle`)
      docsWithoutVersion.forEach(doc => {
        console.log(`   - ${doc.title} (ID: ${doc.id})`)
      })
    }
    
    // Documents avec chemin manquant
    const docsWithMissingPath = documents.filter(d => 
      d.currentVersion && (!d.currentVersion.filePath || d.currentVersion.filePath.trim() === '')
    )
    if (docsWithMissingPath.length > 0) {
      problems.push(`${docsWithMissingPath.length} document(s) avec chemin de fichier manquant`)
      docsWithMissingPath.forEach(doc => {
        console.log(`   - ${doc.title} (ID: ${doc.id})`)
      })
    }
    
    // Documents avec taille 0
    const docsWithZeroSize = documents.filter(d => 
      d.currentVersion && d.currentVersion.fileSize === 0
    )
    if (docsWithZeroSize.length > 0) {
      problems.push(`${docsWithZeroSize.length} document(s) avec taille 0`)
      docsWithZeroSize.forEach(doc => {
        console.log(`   - ${doc.title} (ID: ${doc.id})`)
      })
    }
    
    // Documents sans type MIME
    const docsWithoutMimeType = documents.filter(d => 
      d.currentVersion && (!d.currentVersion.fileType || d.currentVersion.fileType.trim() === '')
    )
    if (docsWithoutMimeType.length > 0) {
      problems.push(`${docsWithoutMimeType.length} document(s) sans type MIME`)
      docsWithoutMimeType.forEach(doc => {
        console.log(`   - ${doc.title} (ID: ${doc.id})`)
      })
    }
    
    if (problems.length > 0) {
      console.log('\n❌ Problèmes détectés:')
      problems.forEach(problem => console.log(`   - ${problem}`))
    } else {
      console.log('\n✅ Aucun problème structurel détecté')
    }
    
    // 5. Recommandations
    console.log('\n5️⃣ Recommandations...')
    
    if (docsWithoutVersion.length > 0) {
      console.log('🔧 Pour les documents sans version:')
      console.log('   - Vérifier le processus de création de versions')
      console.log('   - S\'assurer que currentVersionId est correctement défini')
    }
    
    if (docsWithMissingPath.length > 0) {
      console.log('🔧 Pour les documents sans chemin:')
      console.log('   - Vérifier le processus d\'upload')
      console.log('   - S\'assurer que filePath est sauvegardé correctement')
    }
    
    console.log('\n🔧 Pour résoudre l\'erreur d\'aperçu:')
    console.log('   1. Configurer Supabase Storage')
    console.log('   2. Vérifier les variables d\'environnement Supabase')
    console.log('   3. Tester l\'accès aux fichiers via l\'API Supabase')
    console.log('   4. Vérifier les permissions RLS sur le bucket documents')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testDocumentPreviewSimple()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
