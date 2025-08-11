#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🚀 Déploiement en production...');

try {
  // 1. Vérifier que nous sommes sur la branche master/main
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📍 Branche actuelle: ${currentBranch}`);

  // 2. Vérifier que le build fonctionne localement
  console.log('🔨 Test du build...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi');

  // 3. Vérifier que Prisma peut générer le client
  console.log('🗄️ Génération du client Prisma...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Client Prisma généré');

  // 4. Ajouter tous les fichiers
  console.log('📦 Préparation des fichiers...');
  execSync('git add .', { stdio: 'inherit' });

  // 5. Créer un commit si nécessaire
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      const commitMessage = `🚀 Deploy: ${new Date().toISOString()}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      console.log('✅ Commit créé');
    } else {
      console.log('ℹ️ Aucun changement à commiter');
    }
  } catch (error) {
    console.log('ℹ️ Aucun changement à commiter ou commit déjà effectué');
  }

  // 6. Pousser vers GitHub
  console.log('⬆️ Push vers GitHub...');
  execSync('git push origin HEAD', { stdio: 'inherit' });
  console.log('✅ Code pushé vers GitHub');

  console.log('\n🎉 Préparation terminée !');
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Aller sur https://railway.app et connecter votre repo GitHub');
  console.log('2. Créer une base de données PostgreSQL sur Railway');
  console.log('3. Configurer les variables d\'environnement (voir deployment-config.md)');
  console.log('4. Railway déploiera automatiquement votre application');

} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error);
  process.exit(1);
}
