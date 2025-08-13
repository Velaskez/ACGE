import { execSync } from 'child_process'

const DATABASE_URL = 'postgres://85ac3cefb1cfdf40c8a6405188632847e9f9d3b8196f64b3ef27df1923a492a7:sk_C2QbeAAVSxoSULC_YhGiI@db.prisma.io:5432/?sslmode=require'

async function setupVercelPrisma() {
  try {
    console.log('🔧 Configuration de la connexion Vercel-Prisma...')
    
    // 1. Supprimer l'ancienne variable DATABASE_URL
    console.log('🗑️  Suppression de l\'ancienne variable DATABASE_URL...')
    try {
      execSync('vercel env rm DATABASE_URL --yes', { stdio: 'inherit' })
      console.log('✅ Ancienne variable supprimée')
    } catch (error) {
      console.log('⚠️  Variable déjà supprimée ou erreur (normal)')
    }
    
    // 2. Ajouter la nouvelle variable DATABASE_URL
    console.log('➕ Ajout de la nouvelle variable DATABASE_URL...')
    console.log('📝 Veuillez entrer cette URL dans le prompt :')
    console.log(`   ${DATABASE_URL}`)
    
    // Note: L'utilisateur devra entrer manuellement l'URL
    console.log('\n🔄 Exécution de la commande...')
    execSync('vercel env add DATABASE_URL', { stdio: 'inherit' })
    
    // 3. Synchroniser le schéma
    console.log('🔄 Synchronisation du schéma...')
    execSync('npx prisma db push', { stdio: 'inherit' })
    
    // 4. Générer le client Prisma
    console.log('🔨 Génération du client Prisma...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // 5. Migrer les données
    console.log('📦 Migration des données...')
    execSync('npm run migrate:new-db', { stdio: 'inherit' })
    
    // 6. Redéployer
    console.log('🚀 Redéploiement sur Vercel...')
    execSync('vercel --prod', { stdio: 'inherit' })
    
    console.log('🎉 Configuration terminée avec succès !')
    console.log('🌐 Votre application sera bientôt disponible sur Vercel')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error)
  }
}

setupVercelPrisma()
