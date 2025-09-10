/**
 * 🧪 Script de test des optimisations de recherche
 * 
 * Ce script teste les performances de la barre de recherche optimisée
 * et compare avec l'ancienne version.
 */

const { performance } = require('perf_hooks')

// Configuration de test
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testQueries: [
    'document',
    'rapport',
    'comptable',
    'budget',
    'gabon',
    'trésor',
    'public',
    'ministère',
    'finance',
    'administration'
  ],
  iterations: 5,
  concurrency: 3
}

// Fonctions de test
async function testSearchSuggestions(query, iteration = 1) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=10`)
    const endTime = performance.now()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    const duration = endTime - startTime
    
    return {
      query,
      iteration,
      duration,
      success: true,
      suggestionsCount: data.suggestions?.length || 0,
      error: null
    }
  } catch (error) {
    const endTime = performance.now()
    return {
      query,
      iteration,
      duration: endTime - startTime,
      success: false,
      suggestionsCount: 0,
      error: error.message
    }
  }
}

async function testDocumentsSearch(query, iteration = 1) {
  const startTime = performance.now()
  
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/api/documents?search=${encodeURIComponent(query)}&limit=20`)
    const endTime = performance.now()
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    const duration = endTime - startTime
    
    return {
      query,
      iteration,
      duration,
      success: true,
      documentsCount: data.documents?.length || 0,
      totalCount: data.pagination?.total || 0,
      error: null
    }
  } catch (error) {
    const endTime = performance.now()
    return {
      query,
      iteration,
      duration: endTime - startTime,
      success: false,
      documentsCount: 0,
      totalCount: 0,
      error: error.message
    }
  }
}

async function runConcurrentTests(testFunction, queries, concurrency = 3) {
  const results = []
  
  for (let i = 0; i < queries.length; i += concurrency) {
    const batch = queries.slice(i, i + concurrency)
    const batchPromises = batch.map(query => testFunction(query))
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Petite pause entre les batches
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

function calculateStats(results) {
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  if (successful.length === 0) {
    return {
      totalTests: results.length,
      successful: 0,
      failed: failed.length,
      averageDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      successRate: 0,
      errors: failed.map(f => f.error)
    }
  }
  
  const durations = successful.map(r => r.duration)
  const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)
  const successRate = (successful.length / results.length) * 100
  
  return {
    totalTests: results.length,
    successful: successful.length,
    failed: failed.length,
    averageDuration: Math.round(averageDuration * 100) / 100,
    minDuration: Math.round(minDuration * 100) / 100,
    maxDuration: Math.round(maxDuration * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
    errors: failed.map(f => f.error)
  }
}

async function testCachePerformance() {
  console.log('🧪 Test des performances du cache...')
  
  const query = 'document'
  const results = []
  
  // Premier appel (cache miss)
  console.log('  - Premier appel (cache miss)...')
  const firstCall = await testSearchSuggestions(query, 1)
  results.push(firstCall)
  
  // Deuxième appel (cache hit)
  console.log('  - Deuxième appel (cache hit)...')
  const secondCall = await testSearchSuggestions(query, 2)
  results.push(secondCall)
  
  // Troisième appel (cache hit)
  console.log('  - Troisième appel (cache hit)...')
  const thirdCall = await testSearchSuggestions(query, 3)
  results.push(thirdCall)
  
  const stats = calculateStats(results)
  const cacheImprovement = ((firstCall.duration - secondCall.duration) / firstCall.duration) * 100
  
  console.log(`  ✅ Amélioration du cache: ${Math.round(cacheImprovement)}%`)
  console.log(`  📊 Durée moyenne: ${stats.averageDuration}ms`)
  
  return { stats, cacheImprovement }
}

async function main() {
  console.log('🚀 Démarrage des tests d\'optimisation de recherche')
  console.log('=' .repeat(60))
  
  // Test 1: Suggestions de recherche
  console.log('\n📋 Test 1: API Suggestions de recherche')
  console.log('-'.repeat(40))
  
  const suggestionsResults = []
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    console.log(`\n  Itération ${i + 1}/${TEST_CONFIG.iterations}`)
    const batchResults = await runConcurrentTests(
      testSearchSuggestions, 
      TEST_CONFIG.testQueries, 
      TEST_CONFIG.concurrency
    )
    suggestionsResults.push(...batchResults)
  }
  
  const suggestionsStats = calculateStats(suggestionsResults)
  console.log('\n  📊 Résultats suggestions:')
  console.log(`    - Tests: ${suggestionsStats.totalTests}`)
  console.log(`    - Succès: ${suggestionsStats.successful}`)
  console.log(`    - Échecs: ${suggestionsStats.failed}`)
  console.log(`    - Durée moyenne: ${suggestionsStats.averageDuration}ms`)
  console.log(`    - Durée min: ${suggestionsStats.minDuration}ms`)
  console.log(`    - Durée max: ${suggestionsStats.maxDuration}ms`)
  console.log(`    - Taux de succès: ${suggestionsStats.successRate}%`)
  
  // Test 2: Recherche de documents
  console.log('\n📄 Test 2: API Recherche de documents')
  console.log('-'.repeat(40))
  
  const documentsResults = []
  for (let i = 0; i < TEST_CONFIG.iterations; i++) {
    console.log(`\n  Itération ${i + 1}/${TEST_CONFIG.iterations}`)
    const batchResults = await runConcurrentTests(
      testDocumentsSearch, 
      TEST_CONFIG.testQueries, 
      TEST_CONFIG.concurrency
    )
    documentsResults.push(...batchResults)
  }
  
  const documentsStats = calculateStats(documentsResults)
  console.log('\n  📊 Résultats documents:')
  console.log(`    - Tests: ${documentsStats.totalTests}`)
  console.log(`    - Succès: ${documentsStats.successful}`)
  console.log(`    - Échecs: ${documentsStats.failed}`)
  console.log(`    - Durée moyenne: ${documentsStats.averageDuration}ms`)
  console.log(`    - Durée min: ${documentsStats.minDuration}ms`)
  console.log(`    - Durée max: ${documentsStats.maxDuration}ms`)
  console.log(`    - Taux de succès: ${documentsStats.successRate}%`)
  
  // Test 3: Performance du cache
  console.log('\n💾 Test 3: Performance du cache')
  console.log('-'.repeat(40))
  
  const cacheTest = await testCachePerformance()
  
  // Résumé final
  console.log('\n🎯 RÉSUMÉ DES TESTS')
  console.log('=' .repeat(60))
  console.log(`📋 Suggestions: ${suggestionsStats.averageDuration}ms (${suggestionsStats.successRate}% succès)`)
  console.log(`📄 Documents: ${documentsStats.averageDuration}ms (${documentsStats.successRate}% succès)`)
  console.log(`💾 Cache: ${Math.round(cacheTest.cacheImprovement)}% d'amélioration`)
  
  // Recommandations
  console.log('\n💡 RECOMMANDATIONS')
  console.log('-'.repeat(40))
  
  if (suggestionsStats.averageDuration > 500) {
    console.log('⚠️  Les suggestions sont lentes (>500ms). Vérifiez les index de recherche.')
  } else {
    console.log('✅ Les suggestions sont rapides (<500ms).')
  }
  
  if (documentsStats.averageDuration > 1000) {
    console.log('⚠️  La recherche de documents est lente (>1000ms). Optimisez les requêtes.')
  } else {
    console.log('✅ La recherche de documents est rapide (<1000ms).')
  }
  
  if (cacheTest.cacheImprovement < 50) {
    console.log('⚠️  L\'amélioration du cache est faible (<50%). Vérifiez la configuration.')
  } else {
    console.log('✅ Le cache fonctionne bien (>50% d\'amélioration).')
  }
  
  console.log('\n🏁 Tests terminés!')
}

// Exécuter les tests
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  testSearchSuggestions,
  testDocumentsSearch,
  calculateStats,
  testCachePerformance
}
