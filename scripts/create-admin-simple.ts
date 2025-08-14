import sqlite3 from 'sqlite3'
import path from 'path'
import bcrypt from 'bcryptjs'

console.log('🔐 Création d\'un utilisateur admin avec mot de passe simple...')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const password = 'admin123'
const email = 'admin@acge-gabon.com'

async function createAdmin() {
  try {
    // Hasher le mot de passe
    console.log('🔐 Hachage du mot de passe...')
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Mot de passe haché avec succès')
    
    // Connexion à la base
    const db = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('❌ Erreur de connexion :', err.message)
        return
      }
      console.log('✅ Connexion SQLite réussie !')
      
      // Vérifier si l'utilisateur existe déjà
      db.get("SELECT id, name, email FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
          console.error('❌ Erreur lors de la vérification :', err.message)
          return
        }
        
        if (user) {
          console.log('👤 Utilisateur existe déjà :', user)
          console.log('🔄 Mise à jour du mot de passe...')
          
          // Mettre à jour le mot de passe
          db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], function(err) {
            if (err) {
              console.error('❌ Erreur lors de la mise à jour :', err.message)
              return
            }
            console.log('✅ Mot de passe mis à jour avec succès !')
            console.log('📧 Email :', email)
            console.log('🔑 Mot de passe :', password)
            
            db.close()
          })
        } else {
          // Créer un nouvel utilisateur
          console.log('👤 Création d\'un nouvel utilisateur admin...')
          const userId = 'admin-' + Date.now()
          db.run("INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            [userId, 'Admin ACGE', email, hashedPassword, 'ADMIN', new Date().toISOString(), new Date().toISOString()], 
            function(err) {
              if (err) {
                console.error('❌ Erreur lors de la création :', err.message)
                return
              }
              console.log('✅ Utilisateur admin créé avec succès !')
              console.log('📧 Email :', email)
              console.log('🔑 Mot de passe :', password)
              console.log('🔐 Hash généré :', hashedPassword)
              
              db.close()
            }
          )
        }
      })
    })
    
  } catch (error) {
    console.error('❌ Erreur lors du hachage :', error)
  }
}

// Exécuter le script
createAdmin()
