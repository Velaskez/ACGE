import sqlite3 from 'sqlite3'
import path from 'path'

console.log('🔐 Création d\'un utilisateur avec le hash fourni...')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const providedHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8JZqKqG'

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion :', err.message)
    return
  }
  console.log('✅ Connexion SQLite réussie !')
  
  // Vérifier si l'utilisateur existe déjà
  db.get("SELECT id, name, email FROM users WHERE email = ?", ['admin@acge-gabon.com'], (err, user) => {
    if (err) {
      console.error('❌ Erreur lors de la vérification :', err.message)
      return
    }
    
    if (user) {
      console.log('👤 Utilisateur existe déjà :', user)
      console.log('🔐 Hash actuel dans la base :', providedHash)
      
      // Mettre à jour le hash
      db.run("UPDATE users SET password = ? WHERE email = ?", [providedHash, 'admin@acge-gabon.com'], function(err) {
        if (err) {
          console.error('❌ Erreur lors de la mise à jour :', err.message)
          return
        }
        console.log('✅ Hash mis à jour avec succès !')
        console.log('🔑 Vous pouvez maintenant vous connecter avec le mot de passe correspondant')
        
        db.close()
      })
    } else {
      // Créer un nouvel utilisateur
      const userId = 'admin-' + Date.now()
      db.run("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [userId, 'Admin ACGE', 'admin@acge-gabon.com', providedHash, 'ADMIN', new Date().toISOString(), new Date().toISOString()], 
        function(err) {
          if (err) {
            console.error('❌ Erreur lors de la création :', err.message)
            return
          }
          console.log('✅ Utilisateur créé avec succès !')
          console.log('📧 Email : admin@acge-gabon.com')
          console.log('🔐 Hash :', providedHash)
          console.log('🔑 Vous pouvez maintenant vous connecter avec le mot de passe correspondant')
          
          db.close()
        }
      )
    }
  })
})
