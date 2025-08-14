import bcrypt from 'bcryptjs'

async function testIdentification() {
  try {
    console.log('🔐 Test d\'identification avec l\'ID fourni...')
    
    const providedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG'
    
    console.log('📋 Hash fourni :', providedHash)
    console.log('🔍 Analyse du hash :')
    console.log('- Algorithme : bcrypt ($2a$)')
    console.log('- Coût : 12')
    console.log('- Salt : LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG')
    
    // Test avec quelques mots de passe courants
    const testPasswords = [
      'admin',
      'password',
      '123456',
      'acge',
      'gabon',
      'lws',
      'vercel',
      'nextjs',
      'prisma',
      'mysql'
    ]
    
    console.log('\n🔍 Test de correspondance avec des mots de passe courants :')
    
    for (const password of testPasswords) {
      const isMatch = await bcrypt.compare(password, providedHash)
      console.log(`- "${password}" : ${isMatch ? '✅ CORRESPOND' : '❌ Ne correspond pas'}`)
      
      if (isMatch) {
        console.log(`\n🎉 MOT DE PASSE TROUVÉ : "${password}"`)
        console.log('🔑 Vous pouvez maintenant utiliser ce mot de passe pour vous connecter')
        break
      }
    }
    
    // Générer un nouveau hash pour comparaison
    console.log('\n🔧 Génération d\'un nouveau hash pour comparaison :')
    const testPassword = 'test123'
    const newHash = await bcrypt.hash(testPassword, 12)
    console.log(`- Mot de passe : "${testPassword}"`)
    console.log(`- Nouveau hash : ${newHash}`)
    
    // Vérifier que le nouveau hash fonctionne
    const newHashMatch = await bcrypt.compare(testPassword, newHash)
    console.log(`- Vérification : ${newHashMatch ? '✅ OK' : '❌ Erreur'}`)
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'identification:', error)
  }
}

// Exécuter le script
testIdentification()
