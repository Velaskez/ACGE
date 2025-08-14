import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 12)
  
  console.log('🔐 Hash généré pour le mot de passe admin123:')
  console.log(hash)
  
  // Vérifier le hash
  const isValid = await bcrypt.compare(password, hash)
  console.log('✅ Hash valide:', isValid)
}

generateHash()
