#!/usr/bin/env node

import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

const VERCEL_URL = 'https://acge-27yda9n43-velaskezs-projects.vercel.app'

async function createAdmin() {
  console.log('👑 Création de l\'administrateur sur Vercel...')
  console.log(`🌐 URL: ${VERCEL_URL}`)

  try {
    // Test de l'API
    console.log('\n🔍 Test de l\'API...')
    const testResponse = await fetch(`${VERCEL_URL}/api/setup-admin-lws`)
    
    if (!testResponse.ok) {
      console.error(`❌ Erreur API: ${testResponse.status} ${testResponse.statusText}`)
      return
    }

    const testData = await testResponse.json()
    console.log('✅ API accessible:', testData)

    // Créer l'admin
    console.log('\n👤 Création de l\'administrateur...')
    const createResponse = await fetch(`${VERCEL_URL}/api/setup-admin-lws`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!createResponse.ok) {
      console.error(`❌ Erreur création: ${createResponse.status} ${createResponse.statusText}`)
      const errorData = await createResponse.text()
      console.error('Détails:', errorData)
      return
    }

    const createData = await createResponse.json()
    console.log('✅ Administrateur créé avec succès!')
    console.log('\n📋 Informations:')
    console.log(JSON.stringify(createData, null, 2))

    console.log('\n🎯 Identifiants de connexion:')
    console.log('Email: admin@acge-gabon.com')
    console.log('Mot de passe: Admin2025!')
    console.log(`\n🔗 URL de connexion: ${VERCEL_URL}/login`)

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Suggestions:')
      console.log('1. Vérifiez que l\'URL Vercel est correcte')
      console.log('2. Attendez que le déploiement soit terminé')
      console.log('3. Vérifiez la connexion internet')
    }
  }
}

createAdmin()
