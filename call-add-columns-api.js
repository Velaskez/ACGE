const https = require('https')
const http = require('http')

function callAddColumnsAPI() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Appel de l\'API pour ajouter les colonnes de rejet...')
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/add-rejection-columns',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    
    const req = http.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          
          console.log('📊 Status Code:', res.statusCode)
          console.log('📊 Response Data:', jsonData)
          
          if (res.statusCode === 200) {
            console.log('✅ Succès:', jsonData.message)
            if (jsonData.addedColumns && jsonData.addedColumns.length > 0) {
              console.log('📋 Colonnes ajoutées:', jsonData.addedColumns)
            }
            if (jsonData.existingColumns && jsonData.existingColumns.length > 0) {
              console.log('📋 Colonnes existantes:', jsonData.existingColumns)
            }
            resolve(jsonData)
          } else {
            console.error('❌ Erreur:', jsonData.error)
            console.error('❌ Détails complets:', jsonData)
            reject(new Error(jsonData.error))
          }
        } catch (error) {
          console.error('❌ Erreur lors du parsing de la réponse:', error)
          reject(error)
        }
      })
    })
    
    req.on('error', (error) => {
      console.error('❌ Erreur lors de l\'appel de l\'API:', error)
      reject(error)
    })
    
    req.end()
  })
}

// Vérifier si le serveur est en cours d'exécution
callAddColumnsAPI()
