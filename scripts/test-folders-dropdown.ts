#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'

async function testFoldersDropdown() {
  console.log('🔍 Test des dossiers pour le dropdown')
  console.log('=====================================')
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣ Test connexion base de données...')
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // 2. Récupérer tous les dossiers
    console.log('\n2️⃣ Récupération des dossiers...')
    const folders = await prisma.folder.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        authorId: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`📁 ${folders.length} dossier(s) trouvé(s)`)
    
    if (folders.length === 0) {
      console.log('⚠️ Aucun dossier à tester')
      console.log('💡 Créez d\'abord quelques dossiers via l\'interface')
      return
    }
    
    // 3. Analyser chaque dossier
    console.log('\n3️⃣ Analyse des dossiers...')
    
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i]
      console.log(`\n📁 Dossier ${i + 1}/${folders.length}: ${folder.name}`)
      console.log(`   ID: ${folder.id}`)
      console.log(`   Description: ${folder.description || 'Aucune'}`)
      console.log(`   Auteur ID: ${folder.authorId}`)
      console.log(`   Créé le: ${folder.createdAt.toLocaleDateString()}`)
      
      // Compter les documents dans ce dossier
      const documentCount = await prisma.document.count({
        where: { folderId: folder.id }
      })
      console.log(`   📄 Documents: ${documentCount}`)
    }
    
    // 4. Simuler l'API sidebar/folders
    console.log('\n4️⃣ Simulation API sidebar/folders...')
    
    const apiFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }))
    
    // Ajouter les compteurs
    for (const folder of apiFolders) {
      const documentCount = await prisma.document.count({
        where: { folderId: folder.id }
      })
      folder.documentCount = documentCount
    }
    
    console.log('📤 Données que l\'API devrait retourner:')
    console.log(JSON.stringify(apiFolders, null, 2))
    
    // 5. Test de l'API réelle
    console.log('\n5️⃣ Test de l\'API réelle...')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/sidebar/folders`
    
    console.log(`🌐 URL API: ${apiUrl}`)
    
    try {
      const response = await fetch(apiUrl, {
        credentials: 'include'
      })
      
      console.log(`📡 Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Réponse API:')
        console.log(JSON.stringify(data, null, 2))
        
        if (Array.isArray(data)) {
          console.log(`📁 ${data.length} dossier(s) reçu(s) de l'API`)
        } else {
          console.log('⚠️ L\'API ne retourne pas un tableau')
        }
      } else {
        console.log('❌ Erreur API:', response.status, response.statusText)
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message)
    }
    
    // 6. Recommandations
    console.log('\n6️⃣ Recommandations...')
    
    if (folders.length === 0) {
      console.log('🔧 Pour résoudre le problème:')
      console.log('   1. Créez d\'abord quelques dossiers via l\'interface')
      console.log('   2. Vérifiez que les dossiers sont bien créés en base')
      console.log('   3. Testez à nouveau le dropdown')
    } else {
      console.log('✅ Les dossiers existent, le dropdown devrait fonctionner')
      console.log('🔧 Si le problème persiste:')
      console.log('   1. Vérifiez les logs de la console du navigateur')
      console.log('   2. Vérifiez que l\'API sidebar/folders répond correctement')
      console.log('   3. Vérifiez les permissions d\'accès')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testFoldersDropdown()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
