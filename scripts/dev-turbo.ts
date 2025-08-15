#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Démarrage du serveur de développement avec Turbopack...');

// Vérifier que les variables d'environnement sont présentes
const envFile = join(process.cwd(), '.env.local');
if (!existsSync(envFile)) {
  console.log('⚠️  Fichier .env.local non trouvé. Création d\'un fichier de base...');
  // Créer un fichier .env.local basique si il n'existe pas
  const fs = require('fs');
  const basicEnv = `# Configuration de base pour le développement
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
`;
  fs.writeFileSync(envFile, basicEnv);
}

// Options Turbopack optimisées
const turboOptions = [
  'dev',
  '--turbo',
  '--experimental-turbo',
  '--port', '3000',
  '--hostname', '0.0.0.0'
];

console.log('📦 Options Turbopack:', turboOptions.join(' '));

// Démarrer le serveur
const child = spawn('npx', ['next', ...turboOptions], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    TURBO_FORCE: 'true',
    NEXT_TURBO: '1'
  }
});

child.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`\n👋 Serveur arrêté avec le code: ${code}`);
  process.exit(code || 0);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  child.kill('SIGTERM');
});
