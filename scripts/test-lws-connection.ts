#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import * as ftp from 'basic-ftp'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { join } from 'path'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

console.log('🔧 Test de connexion LWS (MySQL + FTP)')
console.log('=====================================\n')

// Test MySQL
async function testMySQL() {
  console.log('📊 Test de connexion MySQL...')
  console.log('----------------------------')
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non définie dans .env.local')
    return false
  }
  
  // Masquer le mot de passe dans l'affichage
  const urlParts = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)
  if (urlParts) {
    console.log(`📍 Serveur: ${urlParts[3]}:${urlParts[4]}`)
    console.log(`👤 Utilisateur: ${urlParts[1]}`)
    console.log(`📁 Base de données: ${urlParts[5]}`)
  }
  
  const prisma = new PrismaClient()
  
  try {
    // Tester la connexion
    await prisma.$connect()
    console.log('✅ Connexion MySQL établie')
    
    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY table_name
    ` as Array<{ table_name: string }>
    
    console.log(`\n📋 Tables trouvées (${tables.length}):`)
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`)
    })
    
    // Vérifier l'utilisateur admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@acge.local' }
    })
    
    if (adminUser) {
      console.log('\n✅ Utilisateur admin trouvé:')
      console.log(`   - ID: ${adminUser.id}`)
      console.log(`   - Email: ${adminUser.email}`)
      console.log(`   - Rôle: ${adminUser.role}`)
    } else {
      console.log('\n⚠️ Utilisateur admin non trouvé')
      console.log('   Exécutez le script SQL dans phpMyAdmin pour créer l\'admin')
    }
    
    // Compter les enregistrements
    const stats = {
      users: await prisma.user.count(),
      documents: await prisma.document.count(),
      folders: await prisma.folder.count(),
      notifications: await prisma.notification.count()
    }
    
    console.log('\n📊 Statistiques:')
    console.log(`   - Utilisateurs: ${stats.users}`)
    console.log(`   - Documents: ${stats.documents}`)
    console.log(`   - Dossiers: ${stats.folders}`)
    console.log(`   - Notifications: ${stats.notifications}`)
    
    await prisma.$disconnect()
    return true
    
  } catch (error: any) {
    console.error('\n❌ Erreur de connexion MySQL:')
    console.error(`   ${error.message}`)
    
    if (error.code === 'P1001') {
      console.log('\n💡 Solutions possibles:')
      console.log('   1. Vérifiez que le serveur MySQL est accessible')
      console.log('   2. Vérifiez les informations de connexion dans .env.local')
      console.log('   3. Vérifiez que votre IP est autorisée dans LWS')
    } else if (error.code === 'P2002') {
      console.log('\n💡 Il y a une violation de contrainte unique')
    }
    
    await prisma.$disconnect()
    return false
  }
}

// Test FTP
async function testFTP() {
  console.log('\n\n📁 Test de connexion FTP...')
  console.log('---------------------------')
  
  const ftpConfig = {
    host: process.env.FTP_HOST || 'ftp.acge-gabon.com',
    user: process.env.FTP_USER || 'acgeg2647579',
    password: process.env.FTP_PASSWORD || '',
    port: parseInt(process.env.FTP_PORT || '21'),
    secure: process.env.FTP_SECURE === 'true'
  }
  
  if (!ftpConfig.password) {
    console.error('❌ FTP_PASSWORD non défini dans .env.local')
    return false
  }
  
  console.log(`📍 Serveur: ${ftpConfig.host}:${ftpConfig.port}`)
  console.log(`👤 Utilisateur: ${ftpConfig.user}`)
  console.log(`🔒 Sécurisé: ${ftpConfig.secure ? 'Oui' : 'Non'}`)
  
  const client = new ftp.Client()
  client.ftp.verbose = false
  
  try {
    // Se connecter
    await client.access(ftpConfig)
    console.log('✅ Connexion FTP établie')
    
    // Obtenir le répertoire courant
    const pwd = await client.pwd()
    console.log(`\n📂 Répertoire courant: ${pwd}`)
    
    // Lister les fichiers/dossiers à la racine
    const list = await client.list()
    console.log(`\n📋 Contenu (${list.length} éléments):`)
    
    const folders = list.filter(item => item.type === 2)
    const files = list.filter(item => item.type === 1)
    
    if (folders.length > 0) {
      console.log('\n📁 Dossiers:')
      folders.slice(0, 10).forEach(folder => {
        console.log(`   - ${folder.name}`)
      })
      if (folders.length > 10) {
        console.log(`   ... et ${folders.length - 10} autres`)
      }
    }
    
    if (files.length > 0) {
      console.log('\n📄 Fichiers:')
      files.slice(0, 5).forEach(file => {
        const size = (file.size / 1024).toFixed(2)
        console.log(`   - ${file.name} (${size} KB)`)
      })
      if (files.length > 5) {
        console.log(`   ... et ${files.length - 5} autres`)
      }
    }
    
    // Vérifier/créer le dossier uploads
    const uploadDir = process.env.UPLOAD_DIR || '/uploads'
    console.log(`\n📤 Vérification du dossier ${uploadDir}...`)
    
    try {
      await client.cd(uploadDir)
      console.log(`✅ Le dossier ${uploadDir} existe`)
      
      // Lister le contenu
      const uploadsList = await client.list()
      console.log(`   Contenu: ${uploadsList.length} éléments`)
      
    } catch (error) {
      console.log(`⚠️ Le dossier ${uploadDir} n'existe pas`)
      
      try {
        await client.ensureDir(uploadDir)
        console.log(`✅ Le dossier ${uploadDir} a été créé`)
        
        // Créer les sous-dossiers
        await client.ensureDir(`${uploadDir}/documents`)
        await client.ensureDir(`${uploadDir}/avatars`)
        await client.ensureDir(`${uploadDir}/temp`)
        console.log('✅ Sous-dossiers créés (documents, avatars, temp)')
        
      } catch (createError: any) {
        console.error(`❌ Impossible de créer le dossier: ${createError.message}`)
      }
    }
    
    // Test d'upload
    console.log('\n🧪 Test d\'upload/download...')
    
    try {
      const testFileName = `test-${Date.now()}.txt`
      const testContent = Buffer.from(`Test LWS FTP - ${new Date().toISOString()}`)
      const testPath = `${uploadDir}/temp/${testFileName}`
      
      // Upload
      const { Readable } = await import('stream')
      const stream = Readable.from(testContent)
      await client.uploadFrom(stream, testPath)
      console.log(`✅ Upload réussi: ${testPath}`)
      
      // Vérifier la taille
      const size = await client.size(testPath)
      console.log(`   Taille: ${size} octets`)
      
      // Supprimer le fichier test
      await client.remove(testPath)
      console.log('✅ Fichier test supprimé')
      
    } catch (testError: any) {
      console.error(`❌ Erreur lors du test: ${testError.message}`)
    }
    
    client.close()
    return true
    
  } catch (error: any) {
    console.error('\n❌ Erreur de connexion FTP:')
    console.error(`   ${error.message}`)
    
    console.log('\n💡 Solutions possibles:')
    console.log('   1. Vérifiez les identifiants FTP dans .env.local')
    console.log('   2. Vérifiez que le serveur FTP est accessible')
    console.log('   3. Vérifiez les permissions sur le serveur')
    
    client.close()
    return false
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests...\n')
  
  const mysqlOk = await testMySQL()
  const ftpOk = await testFTP()
  
  console.log('\n\n📊 RÉSUMÉ')
  console.log('=========')
  console.log(`MySQL: ${mysqlOk ? '✅ OK' : '❌ Échec'}`)
  console.log(`FTP:   ${ftpOk ? '✅ OK' : '❌ Échec'}`)
  
  if (mysqlOk && ftpOk) {
    console.log('\n🎉 Tous les tests sont passés!')
    console.log('Votre configuration LWS est prête pour la production.')
  } else {
    console.log('\n⚠️ Certains tests ont échoué.')
    console.log('Corrigez les problèmes ci-dessus avant de déployer.')
    process.exit(1)
  }
}

// Lancer les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error)
  process.exit(1)
})
