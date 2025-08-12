#!/usr/bin/env npx tsx

console.log('🔍 Vérification du schéma réel PostgreSQL...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function checkRealSchema() {
  try {
    const response = await fetch(`${APP_URL}/api/force-disable-rls`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Réponse GET schema check:', data)
    } else {
      const error = await response.json()
      console.log('❌ Erreur schema check:', error)
      
      if (error.details && error.details.includes('relation "User" does not exist')) {
        console.log('\n💡 Les tables utilisent probablement des noms en minuscules ou différents')
        console.log('   Exemples possibles:')
        console.log('   - "User" → "users"')
        console.log('   - "Document" → "documents"')
        console.log('   - "DocumentVersion" → "documentversions" ou "document_versions"')
      }
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
  }
}

async function main() {
  console.log('🎯 DIAGNOSTIC SCHÉMA POSTGRESQL')
  console.log('=' .repeat(50))
  
  await checkRealSchema()
}

main().catch(console.error)
