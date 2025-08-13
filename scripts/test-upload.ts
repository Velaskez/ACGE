import fs from 'fs'
import path from 'path'

async function testUpload() {
  try {
    console.log('🧪 Test de l\'upload avec Vercel Blob...')

    // Créer un fichier de test
    const testContent = 'Ceci est un fichier de test pour Vercel Blob'
    const testFilePath = path.join(process.cwd(), 'test-file.txt')
    fs.writeFileSync(testFilePath, testContent)

    // Créer FormData
    const formData = new FormData()
    const file = new File([testContent], 'test-file.txt', { type: 'text/plain' })
    formData.append('files', file)
    formData.append('metadata', JSON.stringify({
      name: 'Fichier de test',
      description: 'Test Vercel Blob',
      folderId: null
    }))

    // Test de l'upload
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWVhMTlkYjIwMDAwYzFqNGQ4amhtbmZpIiwiZW1haWwiOiJhZG1pbkBhY2dlLmdhIiwibmFtZSI6IkFkbWluaXN0cmF0ZXVyIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzU1MDkzMzY1LCJleHAiOjE3NTU2OTgxNjV9.4DE38LVLvDGFPaLaHEDmyTZXCuDS2X0Of-7UIugBmhM'
      }
    })

    console.log('📤 Status:', response.status)
    const result = await response.json()
    console.log('📤 Réponse:', JSON.stringify(result, null, 2))

    // Nettoyer
    fs.unlinkSync(testFilePath)

    if (response.ok) {
      console.log('✅ Upload réussi !')
    } else {
      console.log('❌ Upload échoué')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testUpload()
