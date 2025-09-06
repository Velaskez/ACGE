import { config } from 'dotenv'
import { getSupabaseAdmin } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

// Charger les variables d'environnement
config({ path: '.env.local' })

async function fixUserPasswords() {
  try {
    console.log('🔐 Correction des mots de passe des utilisateurs...')
    
    const supabase = getSupabaseAdmin()
    
    // Récupérer tous les utilisateurs
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, password')
    
    if (fetchError) {
      console.error('❌ Erreur récupération utilisateurs:', fetchError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé')
      return
    }
    
    console.log(`👥 ${users.length} utilisateurs trouvés`)
    
    for (const user of users) {
      console.log(`\n👤 Traitement de ${user.email}...`)
      
      // Vérifier si le mot de passe est déjà hashé
      if (user.password && user.password.startsWith('$2a$')) {
        console.log('✅ Mot de passe déjà hashé')
        continue
      }
      
      // Hasher le mot de passe par défaut
      const defaultPassword = 'admin123'
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)
      
      // Mettre à jour l'utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)
      
      if (updateError) {
        console.error(`❌ Erreur mise à jour ${user.email}:`, updateError)
        continue
      }
      
      console.log(`✅ Mot de passe mis à jour pour ${user.email}`)
      console.log(`🔑 Mot de passe: ${defaultPassword}`)
    }
    
    console.log('\n🎉 Correction terminée !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error)
  }
}

// Exécuter le script
fixUserPasswords()
