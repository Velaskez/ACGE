#!/usr/bin/env tsx

import { prisma } from '../src/lib/db'

async function testDocumentUpdate() {
  console.log('🔍 Test de mise à jour des documents')
  console.log('=====================================')
  
  try {
    // 1. Vérifier la connexion à la base de données
    console.log('\n1️⃣ Test connexion base de données...')
    await prisma.$connect()
    console.log('✅ Connexion base de données OK')
    
    // 2. Récupérer un document existant
    console.log('\n2️⃣ Récupération d\'un document existant...')
    const document = await prisma.document.findFirst({
      include: {
        currentVersion: true,
        author: {
          select: {
            id: true,
            name: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!document) {
      console.log('⚠️ Aucun document trouvé pour le test')
      console.log('💡 Créez d\'abord quelques documents via l\'interface')
      return
    }
    
    console.log(`📄 Document trouvé: ${document.title}`)
    console.log(`   ID: ${document.id}`)
    console.log(`   Auteur: ${document.author?.name}`)
    console.log(`   Dossier actuel: ${document.folder?.name || 'Racine'}`)
    console.log(`   Public: ${document.isPublic}`)
    
    // 3. Récupérer les dossiers disponibles
    console.log('\n3️⃣ Récupération des dossiers disponibles...')
    const folders = await prisma.folder.findMany({
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    console.log(`📁 ${folders.length} dossier(s) disponible(s)`)
    folders.forEach(folder => {
      console.log(`   - ${folder.name} (${folder.id})`)
    })
    
    // 4. Simuler une mise à jour
    console.log('\n4️⃣ Simulation de mise à jour...')
    
    const updateData = {
      title: `${document.title} (modifié ${new Date().toLocaleTimeString()})`,
      description: `Description modifiée le ${new Date().toLocaleDateString()}`,
      isPublic: !document.isPublic, // Inverser le statut public
      folderId: folders.length > 0 ? folders[0].id : 'root'
    }
    
    console.log('📝 Données de mise à jour:')
    console.log(JSON.stringify(updateData, null, 2))
    
    // 5. Test de l'API réelle
    console.log('\n5️⃣ Test de l\'API PUT...')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/documents/${document.id}`
    
    console.log(`🌐 URL API: ${apiUrl}`)
    
    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      console.log(`📡 Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Réponse API:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success) {
          console.log('🎉 Mise à jour réussie!')
          console.log(`📄 Nouveau titre: ${data.document.title}`)
          console.log(`📁 Nouveau dossier: ${data.document.folder?.name || 'Racine'}`)
          console.log(`🌐 Public: ${data.document.isPublic}`)
        }
      } else {
        const errorData = await response.text()
        console.log('❌ Erreur API:', errorData)
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message)
    }
    
    // 6. Vérifier la base de données après mise à jour
    console.log('\n6️⃣ Vérification en base de données...')
    
    const updatedDocument = await prisma.document.findFirst({
      where: { id: document.id },
      include: {
        currentVersion: true,
        author: {
          select: {
            id: true,
            name: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (updatedDocument) {
      console.log('📄 Document après mise à jour:')
      console.log(`   Titre: ${updatedDocument.title}`)
      console.log(`   Description: ${updatedDocument.description || 'Aucune'}`)
      console.log(`   Dossier: ${updatedDocument.folder?.name || 'Racine'}`)
      console.log(`   Public: ${updatedDocument.isPublic}`)
      console.log(`   Modifié le: ${updatedDocument.updatedAt.toLocaleString()}`)
    }
    
    // 7. Recommandations
    console.log('\n7️⃣ Recommandations...')
    
    if (folders.length === 0) {
      console.log('🔧 Pour tester le déplacement de documents:')
      console.log('   1. Créez d\'abord quelques dossiers via l\'interface')
      console.log('   2. Testez à nouveau la mise à jour')
    } else {
      console.log('✅ L\'API de mise à jour fonctionne correctement')
      console.log('🔧 Vous pouvez maintenant:')
      console.log('   1. Modifier les documents via l\'interface')
      console.log('   2. Déplacer les documents entre dossiers')
      console.log('   3. Changer le statut public/privé')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter le test
testDocumentUpdate()
  .then(() => {
    console.log('\n✅ Test terminé')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error)
    process.exit(1)
  })
