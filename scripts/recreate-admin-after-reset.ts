/**
 * Recréer l'utilisateur admin après le reset de la base
 */

const APP_URL = 'https://acge-zeta.vercel.app'

async function recreateAdmin() {
  console.log('👤 Recréation de l\'utilisateur admin après reset...\n')

  try {
    // Attendre que le redéploiement soit terminé
    console.log('⏳ Attente du redéploiement (15 secondes)...')
    await new Promise(resolve => setTimeout(resolve, 15000))

    // Exécuter la migration pour recréer l'admin
    console.log('🔧 Exécution de la migration...')
    const response = await fetch(`${APP_URL}/api/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    console.log(`Migration Status: ${response.status}`)
    
    const result = await response.json()
    console.log('📊 Résultat:', JSON.stringify(result, null, 2))
    
    if (response.ok) {
      console.log('\n🎉 ADMIN RECRÉÉ AVEC SUCCÈS!')
      console.log('📧 Email: admin@acge.ga')
      console.log('🔑 Mot de passe: admin123')
      console.log(`🌐 Login: ${APP_URL}/login`)
      
      console.log('\n✅ Maintenant vous pouvez:')
      console.log('1. Vous reconnecter sur l\'application')
      console.log('2. Les APIs dashboard/stats et notifications devraient fonctionner')
      console.log('3. Toutes les tables sont créées (users, documents, notifications, etc.)')
    } else {
      console.log('❌ Erreur lors de la recréation de l\'admin')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

recreateAdmin()
