#!/usr/bin/env npx tsx

console.log('🔍 Vérification schéma immédiate...\n')

const APP_URL = 'https://acge-zeta.vercel.app'

async function checkSchema() {
  console.log('📋 Vérification des vraies tables...')
  
  try {
    // Attendre 30 secondes pour le déploiement
    console.log('⏳ Attente déploiement...')
    await new Promise(resolve => setTimeout(resolve, 30000))
    
    const response = await fetch(`${APP_URL}/api/check-real-tables`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Schéma récupéré !')
      console.log('\n📊 Tables trouvées:')
      data.tables.forEach((table: any) => {
        console.log(`  - ${table.table_name}`)
      })
      
      console.log('\n🔒 Status RLS:')
      data.rlsStatus.forEach((table: any) => {
        const status = table.rowsecurity ? '🔒 Activé' : '🔓 Désactivé'
        console.log(`  - ${table.tablename}: ${status}`)
      })
      
      return data
    } else {
      const error = await response.json()
      console.log('❌ Erreur check schema:', error)
      return null
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error)
    return null
  }
}

async function main() {
  console.log('🎯 VÉRIFICATION SCHÉMA POSTGRESQL')
  console.log('=' .repeat(50))
  
  const schema = await checkSchema()
  
  if (schema) {
    console.log('\n💡 Prochaines étapes:')
    console.log('1. Utiliser les vrais noms de tables trouvés')
    console.log('2. Désactiver RLS sur les tables avec rowsecurity=true')
    console.log('3. Tester les APIs dashboard')
  }
}

main().catch(console.error)
