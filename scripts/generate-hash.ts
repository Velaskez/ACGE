#!/usr/bin/env npx tsx
import bcrypt from 'bcryptjs'

async function generateHash() {
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 12)
  
  console.log('📝 Hash généré pour le mot de passe "admin123":')
  console.log(hash)
  console.log('')
  console.log('🔧 Utilisez ce hash dans le fichier SQL:')
  console.log(`'${hash}'`)
}

generateHash().catch(console.error)
