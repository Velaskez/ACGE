import sqlite3 from 'sqlite3'
import path from 'path'

console.log('🔍 Test direct de SQLite...')

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
console.log('📁 Chemin de la base :', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion :', err.message)
    return
  }
  console.log('✅ Connexion SQLite réussie !')
  
  // Lister les tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Erreur lors de la lecture des tables :', err.message)
      return
    }
    console.log('📊 Tables disponibles :', tables)
    
    // Compter les utilisateurs
    db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
      if (err) {
        console.error('❌ Erreur lors du comptage des utilisateurs :', err.message)
        return
      }
      console.log(`👥 Nombre d'utilisateurs : ${result.count}`)
      
      // Lister les utilisateurs
      db.all("SELECT id, name, email, role FROM users LIMIT 5", (err, users) => {
        if (err) {
          console.error('❌ Erreur lors de la lecture des utilisateurs :', err.message)
          return
        }
        console.log('👤 Utilisateurs trouvés :', users)
        
        // Fermer la connexion
        db.close((err) => {
          if (err) {
            console.error('❌ Erreur lors de la fermeture :', err.message)
            return
          }
          console.log('🔌 Connexion fermée')
        })
      })
    })
  })
})
