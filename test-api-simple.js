const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSimpleAPI() {
  try {
    console.log('🧪 Test simple de l\'API...')
    
    // 1. Tester directement avec Supabase admin
    console.log('📊 1. Test direct avec Supabase admin...')
    
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', '36433ebc-7cb4-4510-b469-6e6ada720036')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Erreur Supabase direct:', error)
      return false
    }
    
    console.log(`✅ ${notifications.length} notifications trouvées directement`)
    
    // 2. Tester l'API Next.js
    console.log('🌐 2. Test de l\'API Next.js...')
    
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '36433ebc-7cb4-4510-b469-6e6ada720036'
        }
      })
      
      console.log('📡 Status:', response.status)
      console.log('📡 Headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ API Next.js fonctionne:', data)
        return true
      } else {
        const errorText = await response.text()
        console.error('❌ Erreur API Next.js:', response.status, errorText)
        return false
      }
      
    } catch (fetchError) {
      console.error('❌ Erreur fetch:', fetchError.message)
      return false
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error)
    return false
  }
}

// Exécuter le test
async function main() {
  console.log('🎯 Test simple de l\'API')
  
  const success = await testSimpleAPI()
  
  if (success) {
    console.log('🎉 Test réussi!')
  } else {
    console.log('❌ Test échoué')
  }
}

main().catch(console.error)
