/**
 * 🚀 Exécution immédiate de la migration
 * 
 * Ce script exécute la migration directement avec le mot de passe
 * que vous devez fournir
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'
import { join } from 'path'
import { writeFileSync, readFileSync } from 'fs'

async function executeMigrationNow() {
  console.log('🚀 Exécution immédiate de la migration\n')
  
  try {
    // 1. Charger les variables d'environnement
    const envPath = join(process.cwd(), '.env.local')
    config({ path: envPath })
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL manquante')
    }
    
    console.log('✅ Configuration Supabase chargée')
    console.log('🌐 URL:', supabaseUrl)
    
    // 2. Extraire les informations de connexion
    const urlParts = supabaseUrl.split('//')[1].split('.')
    const projectRef = urlParts[0]
    
    console.log('🔑 Project Ref:', projectRef)
    
    // 3. Lire le fichier de migration existant
    const migrationFile = join(process.cwd(), 'migration.sql')
    if (!readFileSync(migrationFile, 'utf8')) {
      throw new Error('Fichier migration.sql non trouvé')
    }
    
    console.log('📄 Fichier de migration trouvé')
    
    // 4. Demander le mot de passe de base de données
    console.log('\n🔑 INSTRUCTIONS:')
    console.log('1. Allez dans votre Supabase Dashboard')
    console.log('2. Allez dans Settings > Database')
    console.log('3. Copiez le mot de passe de la base de données')
    console.log('4. Collez-le ci-dessous (il ne sera pas affiché)')
    console.log('')
    
    // 5. Construire l'URL de connexion
    const dbPassword = process.env.SUPABASE_DB_PASSWORD || 'YOUR_PASSWORD_HERE'
    const dbUrl = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`
    
    console.log('📊 URL de connexion:', dbUrl.replace(dbPassword, '***'))
    
    // 6. Exécuter la migration
    console.log('\n🚀 Exécution de la migration...')
    
    try {
      const command = `docker run --rm -v "${process.cwd()}:/workspace" -w /workspace supabase/postgres:15.1.0.147 psql "${dbUrl}" -f migration.sql`
      
      console.log('📋 Commande Docker:', command.replace(dbPassword, '***'))
      
      const result = execSync(command, { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 60000 // 60 secondes de timeout
      })
      
      console.log('✅ Migration exécutée avec succès!')
      console.log('📊 Résultat:', result)
      
      // Nettoyer le fichier temporaire
      try {
        execSync(`rm "${migrationFile}"`, { stdio: 'pipe' })
        console.log('🧹 Fichier temporaire nettoyé')
      } catch (cleanupError) {
        console.log('⚠️ Impossible de nettoyer le fichier temporaire')
      }
      
    } catch (execError) {
      console.log('❌ Erreur lors de l\'exécution:', execError.message)
      
      if (execError.message.includes('password authentication failed')) {
        console.log('\n💡 SOLUTION:')
        console.log('1. Vérifiez que le mot de passe est correct')
        console.log('2. Ajoutez SUPABASE_DB_PASSWORD=votre_mot_de_passe dans .env.local')
        console.log('3. Relancez ce script')
      } else if (execError.message.includes('could not connect')) {
        console.log('\n💡 SOLUTION:')
        console.log('1. Vérifiez votre connexion internet')
        console.log('2. Vérifiez que le projet Supabase est actif')
      }
    }
    
    // 7. Vérifier la structure finale
    console.log('\n📊 Vérification de la structure finale...')
    
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || '')
    
    const { data: testDoc, error: testError } = await supabase
      .from('documents')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError)
    } else if (testDoc && testDoc.length > 0) {
      console.log('✅ Structure mise à jour:')
      console.log('📋 Colonnes disponibles:', Object.keys(testDoc[0]).join(', '))
      
      const fileColumns = ['file_name', 'file_size', 'file_type', 'file_path', 'url', 'tags', 'is_public']
      const missingColumns = fileColumns.filter(col => !(col in testDoc[0]))
      
      if (missingColumns.length === 0) {
        console.log('🎉 Toutes les colonnes de fichier ont été ajoutées!')
        console.log('\n✅ MIGRATION TERMINÉE AVEC SUCCÈS!')
        console.log('📝 Prochaines étapes:')
        console.log('1. Re-uploader un document pour tester')
        console.log('2. Vérifier que l\'aperçu fonctionne')
      } else {
        console.log('⚠️ Colonnes manquantes:', missingColumns.join(', '))
        console.log('💡 La migration n\'a peut-être pas été complètement appliquée')
      }
    }
    
  } catch (error) {
    console.error('💥 Erreur lors de la migration:', error)
  }
}

// Exécuter la migration
executeMigrationNow()
