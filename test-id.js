const bcrypt = require('bcryptjs');

async function testIdentification() {
  try {
    console.log('🔐 Test d\'identification avec l\'ID fourni...');
    
    const providedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG';
    
    console.log('📋 Hash fourni :', providedHash);
    console.log('🔍 Analyse du hash :');
    console.log('- Algorithme : bcrypt ($2a$)');
    console.log('- Coût : 12');
    
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
      'mysql',
      'test',
      'demo',
      'user',
      'root'
    ];
    
    console.log('\n🔍 Test de correspondance avec des mots de passe courants :');
    
    for (const password of testPasswords) {
      const isMatch = await bcrypt.compare(password, providedHash);
      console.log(`- "${password}" : ${isMatch ? '✅ CORRESPOND' : '❌ Ne correspond pas'}`);
      
      if (isMatch) {
        console.log(`\n🎉 MOT DE PASSE TROUVÉ : "${password}"`);
        console.log('🔑 Vous pouvez maintenant utiliser ce mot de passe pour vous connecter');
        return;
      }
    }
    
    console.log('\n❌ Aucun mot de passe correspondant trouvé dans la liste de test');
    console.log('💡 Essayez de vous connecter avec des mots de passe que vous connaissez');
    
  } catch (error) {
    console.error('❌ Erreur lors du test d\'identification:', error);
  }
}

// Exécuter le script
testIdentification();
