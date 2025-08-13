async function testVercelBlob() {
  try {
    console.log('🧪 Test de Vercel Blob...')
    
    const response = await fetch('https://acge-app.vercel.app/api/test-blob?filename=test-vercel-blob.txt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📤 Status:', response.status)
    console.log('📤 Headers:', Object.fromEntries(response.headers.entries()))
    
    const result = await response.json()
    console.log('📤 Réponse:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('✅ Vercel Blob fonctionne !')
      console.log('🔗 URL du blob:', result.url)
    } else {
      console.log('❌ Erreur Vercel Blob')
    }
    
  } catch (error) {
    console.error('💥 Erreur:', error)
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
    }
  }
}

testVercelBlob()
