// Import immédiat vers PostgreSQL local

import { execSync } from 'child_process'
import fs from 'fs'

async function importPostgreSQLNow() {
  console.log('🚀 Import immédiat vers PostgreSQL local\n')
  
  const psqlPath = '"C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe"'
  
  try {
    // 1. Vérifier PostgreSQL
    console.log('1. 🔍 Test PostgreSQL...')
    const version = execSync(`${psqlPath} --version`, { encoding: 'utf8' })
    console.log(`   ✅ ${version.trim()}`)
    
    // 2. Trouver le fichier de backup
    console.log('\n2. 📁 Recherche du fichier de backup...')
    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('acge_backup_full_'))
    
    if (backupFiles.length === 0) {
      console.log('   ❌ Aucun fichier de backup trouvé')
      return
    }
    
    const backupFile = backupFiles[0]
    console.log(`   ✅ Fichier trouvé: ${backupFile}`)
    
    // 3. Commands d'import
    const commands = {
      testConnection: `${psqlPath} -U postgres -d postgres -c "SELECT 'Connexion OK!' as status;"`,
      createDb: `${psqlPath} -U postgres -c "DROP DATABASE IF EXISTS acge_local; CREATE DATABASE acge_local;"`,
      importData: `${psqlPath} -U postgres -d acge_local -f ${backupFile}`,
      verifyData: `${psqlPath} -U postgres -d acge_local -c "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION SELECT 'documents', COUNT(*) FROM documents UNION SELECT 'folders', COUNT(*) FROM folders ORDER BY table_name;"`
    }
    
    console.log('\n🚀 PROCÉDURE D\'IMPORT AUTOMATIQUE:\n')
    
    console.log('3. 🔗 Test de connexion...')
    console.log(`Commande: ${commands.testConnection}`)
    console.log('💡 Entrez votre mot de passe postgres quand demandé\n')
    
    try {
      execSync(commands.testConnection, { stdio: 'inherit' })
      console.log('✅ Connexion réussie!\n')
      
      console.log('4. 🗄️ Création de la base acge_local...')
      execSync(commands.createDb, { stdio: 'inherit' })
      console.log('✅ Base créée!\n')
      
      console.log('5. 📦 Import des données...')
      execSync(commands.importData, { stdio: 'inherit' })
      console.log('✅ Données importées!\n')
      
      console.log('6. 🔍 Vérification...')
      const verification = execSync(commands.verifyData, { encoding: 'utf8' })
      console.log('✅ Vérification réussie:')
      console.log(verification)
      
      // 7. Configuration de l'application
      console.log('7. ⚙️ Configuration .env.local...')
      
      let envContent = ''
      if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8')
      }
      
      // Remplacer ou ajouter DATABASE_URL
      const newDatabaseUrl = 'DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"'
      
      if (envContent.includes('DATABASE_URL=')) {
        envContent = envContent.replace(/DATABASE_URL=.*/, newDatabaseUrl)
      } else {
        envContent += '\n' + newDatabaseUrl + '\n'
      }
      
      fs.writeFileSync('.env.local', envContent)
      console.log('✅ .env.local mis à jour')
      
      console.log('\n🎉 IMPORT TERMINÉ AVEC SUCCÈS!\n')
      
      console.log('✅ PostgreSQL local configuré')
      console.log('✅ Base acge_local créée et peuplée')
      console.log('✅ .env.local mis à jour')
      
      console.log('\n🔧 DERNIÈRES ÉTAPES:\n')
      
      console.log('1. 🔑 Remplacez VOTRE_MOT_DE_PASSE dans .env.local')
      console.log('   par votre vrai mot de passe postgres')
      console.log('')
      
      console.log('2. 🔄 Redémarrez votre application:')
      console.log('   npm run dev')
      console.log('')
      
      console.log('3. 🧪 Testez la connexion:')
      console.log('   npx tsx scripts/test-apis-with-current-setup.ts')
      console.log('')
      
      console.log('🌐 ACCÈS À VOS DONNÉES:')
      console.log('   💻 pgAdmin 4 (installé avec PostgreSQL)')
      console.log('   🎨 Prisma Studio: npx prisma studio')
      console.log(`   📱 SQL Shell: ${psqlPath} -U postgres -d acge_local`)
      
    } catch (error) {
      console.log('\n⚠️ Import automatique échoué')
      console.log('💡 COMMANDES MANUELLES À EXÉCUTER:\n')
      
      console.log('🔵 Étape 1: Test de connexion')
      console.log(commands.testConnection)
      console.log('')
      
      console.log('🔵 Étape 2: Création de la base')
      console.log(commands.createDb)
      console.log('')
      
      console.log('🔵 Étape 3: Import des données')
      console.log(commands.importData)
      console.log('')
      
      console.log('🔵 Étape 4: Vérification')
      console.log(commands.verifyData)
      console.log('')
      
      console.log('💡 Copiez-collez chaque commande dans votre terminal')
      console.log('💡 Entrez votre mot de passe postgres quand demandé')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

importPostgreSQLNow().catch(console.error)
