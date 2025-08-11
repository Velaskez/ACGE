#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

console.log('🔍 Vérification pré-déploiement...\n');

let errors: string[] = [];
let warnings: string[] = [];

// 1. Vérifier que les fichiers essentiels existent
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'prisma/schema.prisma',
  'src/app/layout.tsx',
  'railway.json',
  'Procfile'
];

console.log('📁 Vérification des fichiers essentiels...');
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    errors.push(`Fichier manquant: ${file}`);
    console.log(`  ❌ ${file}`);
  }
});

// 2. Vérifier package.json
console.log('\n📦 Vérification de package.json...');
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['build', 'start', 'db:generate', 'db:deploy'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts[script]) {
      console.log(`  ✅ Script "${script}" défini`);
    } else {
      errors.push(`Script manquant dans package.json: ${script}`);
      console.log(`  ❌ Script "${script}" manquant`);
    }
  });

  const requiredDeps = ['@prisma/client', 'next', 'react'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ✅ Dépendance "${dep}" présente`);
    } else {
      errors.push(`Dépendance manquante: ${dep}`);
      console.log(`  ❌ Dépendance "${dep}" manquante`);
    }
  });
} catch (error) {
  errors.push('Impossible de lire package.json');
}

// 3. Vérifier Prisma
console.log('\n🗄️ Vérification de Prisma...');
try {
  const schema = readFileSync('prisma/schema.prisma', 'utf8');
  if (schema.includes('provider = "postgresql"')) {
    console.log('  ✅ Configuration PostgreSQL détectée');
  } else {
    warnings.push('Schema Prisma ne semble pas configuré pour PostgreSQL');
    console.log('  ⚠️ Configuration base de données à vérifier');
  }
} catch (error) {
  errors.push('Impossible de lire le schema Prisma');
}

// 4. Test de build
console.log('\n🔨 Test de build...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('  ✅ Build réussi');
} catch (error) {
  errors.push('Échec du build - voir les détails ci-dessous');
  console.log('  ❌ Échec du build');
}

// 5. Vérifier la génération Prisma
console.log('\n⚙️ Test de génération Prisma...');
try {
  execSync('npm run db:generate', { stdio: 'pipe' });
  console.log('  ✅ Client Prisma généré');
} catch (error) {
  errors.push('Impossible de générer le client Prisma');
  console.log('  ❌ Échec génération Prisma');
}

// 6. Vérifier Git
console.log('\n📝 État Git...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (status.trim()) {
    warnings.push('Changements non commitées détectés');
    console.log('  ⚠️ Changements non commitées');
    console.log('    Exécutez: git add . && git commit -m "Pre-deploy commit"');
  } else {
    console.log('  ✅ Aucun changement en attente');
  }

  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`  📍 Branche actuelle: ${branch}`);
} catch (error) {
  warnings.push('Impossible de vérifier l\'état Git');
}

// Résumé final
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 TOUT EST PRÊT POUR LE DÉPLOIEMENT !');
  console.log('\nProchaines étapes :');
  console.log('1. npm run deploy:prod');
  console.log('2. Configurer sur railway.app/render.com/fly.io');
  console.log('3. Voir DEPLOYMENT_GUIDE.md pour les détails');
} else {
  if (errors.length > 0) {
    console.log('❌ ERREURS À CORRIGER :');
    errors.forEach(error => console.log(`   • ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️ AVERTISSEMENTS :');
    warnings.forEach(warning => console.log(`   • ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n🔧 Corrigez les erreurs avant de déployer');
    process.exit(1);
  }
}

console.log('\n📖 Consultez DEPLOYMENT_GUIDE.md pour le guide complet');
