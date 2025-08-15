#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

console.log('🧪 Test de la configuration Turbopack...\n');

// Vérifications
const checks = [
  {
    name: 'Package.json - Script dev avec turbo',
    check: () => {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
      return packageJson.scripts.dev.includes('--turbo');
    }
  },
  {
    name: 'Next.config.ts - Configuration turbo',
    check: () => {
      const config = readFileSync('next.config.ts', 'utf8');
      return config.includes('turbo:') && config.includes('rules:');
    }
  },
  {
    name: 'Fichier turbo.json',
    check: () => existsSync('turbo.json')
  },
  {
    name: 'Script dev-turbo.ts',
    check: () => existsSync('scripts/dev-turbo.ts')
  },
  {
    name: 'Documentation Turbopack',
    check: () => existsSync('docs/TURBOPACK_SETUP.md')
  }
];

let allPassed = true;

for (const check of checks) {
  try {
    const passed = check.check();
    console.log(`${passed ? '✅' : '❌'} ${check.name}`);
    if (!passed) allPassed = false;
  } catch (error) {
    console.log(`❌ ${check.name} - Erreur: ${error}`);
    allPassed = false;
  }
}

console.log('\n📊 Résultats:');
console.log(`Scripts disponibles:`);
console.log(`  npm run dev          - Turbopack de base`);
console.log(`  npm run dev:turbo    - Turbopack expérimental`);
console.log(`  npm run dev:fast     - Port 3001`);
console.log(`  npm run dev:optimized - Script personnalisé`);

if (allPassed) {
  console.log('\n🎉 Configuration Turbopack validée !');
  console.log('💡 Pour démarrer: npm run dev');
} else {
  console.log('\n⚠️  Certaines vérifications ont échoué.');
  console.log('🔧 Vérifiez la configuration manuellement.');
}

// Test de la commande Next.js avec Turbopack
console.log('\n🔍 Test de la commande Next.js...');
try {
  const output = execSync('npx next dev --turbo --help', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  if (output.includes('--turbo')) {
    console.log('✅ Commande Next.js avec Turbopack disponible');
  } else {
    console.log('❌ Commande Turbopack non reconnue');
  }
} catch (error) {
  console.log('❌ Erreur lors du test de la commande:', error);
}
