import { prisma } from '../src/lib/db'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: any
}

async function testFilters() {
  const results: TestResult[] = []
  
  console.log('🔍 Début des tests de filtres...\n')

  try {
    // Test 1: Vérifier la connexion à la base de données
    console.log('1. Test de connexion à la base de données...')
    await prisma.$connect()
    results.push({
      test: 'Connexion DB',
      status: 'success',
      message: 'Connexion réussie'
    })
    console.log('✅ Connexion réussie\n')

    // Test 2: Vérifier l'existence des tables
    console.log('2. Vérification des tables...')
    const tables = ['Document', 'Folder', 'User', 'DocumentVersion']
    for (const table of tables) {
      try {
        // Test simple pour vérifier l'existence de la table
        if (table === 'Document') {
          await prisma.document.count()
        } else if (table === 'Folder') {
          await prisma.folder.count()
        } else if (table === 'User') {
          await prisma.user.count()
        } else if (table === 'DocumentVersion') {
          await prisma.documentVersion.count()
        }
        results.push({
          test: `Table ${table}`,
          status: 'success',
          message: 'Table accessible'
        })
      } catch (error) {
        results.push({
          test: `Table ${table}`,
          status: 'error',
          message: `Table non accessible: ${error}`
        })
      }
    }
    console.log('✅ Vérification des tables terminée\n')

    // Test 3: Test des filtres de base
    console.log('3. Test des filtres de base...')
    
    // Test recherche textuelle
    try {
      const searchResults = await prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        take: 5
      })
      results.push({
        test: 'Recherche textuelle',
        status: 'success',
        message: `${searchResults.length} résultats trouvés`,
        details: searchResults.map(d => ({ id: d.id, title: d.title }))
      })
    } catch (error) {
      results.push({
        test: 'Recherche textuelle',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }

    // Test filtre par dossier
    try {
      const folderResults = await prisma.document.findMany({
        where: {
          folderId: null // Documents sans dossier
        },
        take: 5
      })
      results.push({
        test: 'Filtre par dossier',
        status: 'success',
        message: `${folderResults.length} documents sans dossier trouvés`
      })
    } catch (error) {
      results.push({
        test: 'Filtre par dossier',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }

    // Test filtre par type de fichier
    try {
      const fileTypeResults = await prisma.document.findMany({
        where: {
          currentVersion: {
            fileType: { contains: 'pdf', mode: 'insensitive' }
          }
        },
        include: {
          currentVersion: true
        },
        take: 5
      })
      results.push({
        test: 'Filtre par type de fichier',
        status: 'success',
        message: `${fileTypeResults.length} documents PDF trouvés`
      })
    } catch (error) {
      results.push({
        test: 'Filtre par type de fichier',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }

    // Test filtre par taille
    try {
      const sizeResults = await prisma.document.findMany({
        where: {
          currentVersion: {
            fileSize: {
              gte: 1024 * 1024 // 1MB
            }
          }
        },
        include: {
          currentVersion: true
        },
        take: 5
      })
      results.push({
        test: 'Filtre par taille',
        status: 'success',
        message: `${sizeResults.length} documents > 1MB trouvés`
      })
    } catch (error) {
      results.push({
        test: 'Filtre par taille',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }

    // Test filtre par date
    try {
      const dateResults = await prisma.document.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
          }
        },
        take: 5
      })
      results.push({
        test: 'Filtre par date',
        status: 'success',
        message: `${dateResults.length} documents récents trouvés`
      })
    } catch (error) {
      results.push({
        test: 'Filtre par date',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }

    // Test filtre par tags
    try {
      const tagResults = await prisma.document.findMany({
        where: {
          tags: {
            some: {
              name: { contains: 'important', mode: 'insensitive' }
            }
          }
        },
        include: {
          tags: true
        },
        take: 5
      })
      results.push({
        test: 'Filtre par tags',
        status: 'success',
        message: `${tagResults.length} documents avec tags trouvés`
      })
    } catch (error) {
      results.push({
        test: 'Filtre par tags',
        status: 'warning',
        message: `Tags non disponibles: ${error}`
      })
    }

    console.log('✅ Tests des filtres de base terminés\n')

    // Test 4: Test de tri
    console.log('4. Test des options de tri...')
    
    const sortFields = ['title', 'createdAt', 'updatedAt']
    const sortOrders = ['asc', 'desc']
    
    for (const field of sortFields) {
      for (const order of sortOrders) {
        try {
          const sortResults = await prisma.document.findMany({
            orderBy: {
              [field]: order
            },
            take: 3
          })
          results.push({
            test: `Tri ${field} ${order}`,
            status: 'success',
            message: `${sortResults.length} résultats triés`
          })
        } catch (error) {
          results.push({
            test: `Tri ${field} ${order}`,
            status: 'error',
            message: `Erreur: ${error}`
          })
        }
      }
    }
    console.log('✅ Tests de tri terminés\n')

    // Test 5: Test de pagination
    console.log('5. Test de pagination...')
    try {
      const page1 = await prisma.document.findMany({
        skip: 0,
        take: 5
      })
      const page2 = await prisma.document.findMany({
        skip: 5,
        take: 5
      })
      
      if (page1.length > 0 || page2.length > 0) {
        results.push({
          test: 'Pagination',
          status: 'success',
          message: `Page 1: ${page1.length}, Page 2: ${page2.length}`
        })
      } else {
        results.push({
          test: 'Pagination',
          status: 'warning',
          message: 'Aucun document pour tester la pagination'
        })
      }
    } catch (error) {
      results.push({
        test: 'Pagination',
        status: 'error',
        message: `Erreur: ${error}`
      })
    }
    console.log('✅ Test de pagination terminé\n')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
    results.push({
      test: 'Test général',
      status: 'error',
      message: `Erreur: ${error}`
    })
  } finally {
    await prisma.$disconnect()
  }

  // Affichage des résultats
  console.log('📊 RÉSULTATS DES TESTS')
  console.log('=' * 50)
  
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const warningCount = results.filter(r => r.status === 'warning').length
  
  console.log(`✅ Succès: ${successCount}`)
  console.log(`❌ Erreurs: ${errorCount}`)
  console.log(`⚠️  Avertissements: ${warningCount}`)
  console.log('')
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⚠️'
    console.log(`${icon} ${result.test}: ${result.message}`)
    if (result.details) {
      console.log(`   Détails: ${JSON.stringify(result.details, null, 2)}`)
    }
  })
  
  console.log('\n' + '=' * 50)
  
  if (errorCount === 0) {
    console.log('🎉 Tous les tests sont passés avec succès!')
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.')
  }
}

// Exécuter les tests
testFilters()
  .catch(console.error)
  .finally(() => process.exit(0))
