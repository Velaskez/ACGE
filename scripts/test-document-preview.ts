#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import { prisma } from '../src/lib/db'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDocumentPreview() {
  console.log('🔍 Test diagnostic aperçu documents')
  console.log('=====================================')
  
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
    
    // 3. Tester chaque document
    console.log('\n3️⃣ Test des documents individuels...')
    
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i]
      console.log(`\n📄 Document ${i + 1}/${documents.length}: ${doc.title}`)
      console.log(`   ID: ${doc.id}`)
      console.log(`   Auteur: ${doc.author?.name || 'N/A'}`)
      
      if (!doc.currentVersion) {
        console.log('   ❌ Aucune version actuelle')
        continue
      }
      
      console.log(`   📁 Fichier: ${doc.currentVersion.fileName}`)
      console.log(`   📂 Chemin: ${doc.currentVersion.filePath}`)
      console.log(`   📊 Taille: ${doc.currentVersion.fileSize} bytes`)
      console.log(`   🏷️ Type: ${doc.currentVersion.fileType}`)
      
      // 4. Tester l'accès au fichier dans Supabase Storage
      console.log('   🔍 Test accès Supabase Storage...')
      
      let filePath = doc.currentVersion.filePath
      
      // Traiter le chemin du fichier
      if (filePath.includes('supabase.co') || filePath.startsWith('http')) {
        const urlParts = filePath.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const userIdFromPath = urlParts[urlParts.length - 2]
        filePath = `${userIdFromPath}/${fileName}`
        console.log(`   🔧 Chemin extrait: ${filePath}`)
      }
      
      try {
        const { data, error } = await supabase.storage
          .from('documents')
          .download(filePath)
        
        if (error) {
          console.log(`   ❌ Erreur Supabase: ${error.message}`)
          
          // Essayer de lister les fichiers dans le bucket pour diagnostiquer
          console.log('   🔍 Diagnostic bucket...')
          const { data: listData, error: listError } = await supabase.storage
            .from('documents')
            .list()
          
          if (listError) {
            console.log(`   ❌ Erreur liste bucket: ${listError.message}`)
          } else {
            console.log(`   📋 ${listData.length} fichier(s) dans le bucket`)
            if (listData.length > 0) {
              console.log('   📝 Premiers fichiers:')
              listData.slice(0, 5).forEach(file => {
                console.log(`      - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`)
              })
            }
          }
        } else if (data) {
          console.log(`   ✅ Fichier accessible, taille: ${data.size} bytes`)
          
          // Vérifier la cohérence des tailles
          if (data.size !== doc.currentVersion.fileSize) {
            console.log(`   ⚠️ Incohérence de taille: DB=${doc.currentVersion.fileSize}, Storage=${data.size}`)
          }
        } else {
          console.log('   ❌ Aucune donnée reçue')
        }
      } catch (storageError) {
        console.log(`   ❌ Erreur exception: ${storageError}`)
      }
    }
    
    // 5. Test de l'API de téléchargement
    console.log('\n4️⃣ Test API de téléchargement...')
    
    const testDoc = documents[0]
    if (testDoc) {
      console.log(`📄 Test avec document: ${testDoc.title}`)
      
      // Simuler une requête API
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const apiUrl = `${baseUrl}/api/documents/${testDoc.id}/download`
      
      console.log(`🌐 URL API: ${apiUrl}`)
      console.log('⚠️ Note: Ce test nécessite une authentification valide')
    }
    
    // 6. Résumé des problèmes potentiels
    console.log('\n5️⃣ Diagnostic des problèmes potentiels...')
    
    const problems = []
    
    // Vérifier les documents sans version
    const docsWithoutVersion = documents.filter(d => !d.currentVersion)
    if (docsWithoutVersion.length > 0) {
      problems.push(`${docsWithoutVersion.length} document(s) sans version actuelle`)
    }
    
    // Vérifier les chemins de fichiers
    const docsWithInvalidPath = documents.filter(d => 
      d.currentVersion && (!d.currentVersion.filePath || d.currentVersion.filePath.trim() === '')
    )
    if (docsWithInvalidPath.length > 0) {
      problems.push(`${docsWithInvalidPath.length} document(s) avec chemin de fichier invalide`)
    }
    
    if (problems.length > 0) {
      console.log('❌ Problèmes détectés:')
      problems.forEach(problem => console.log(`   - ${problem}`))
    } else {
      console.log('✅ Aucun problème structurel détecté')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testDocumentPreview()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
