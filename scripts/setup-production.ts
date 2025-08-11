#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';

console.log('🏭 Configuration pour la production...\n');

// 1. Optimiser next.config.ts pour la production
console.log('⚙️ Optimisation de next.config.ts...');

const nextConfigPath = 'next.config.ts';
if (existsSync(nextConfigPath)) {
  const currentConfig = readFileSync(nextConfigPath, 'utf8');
  
  // Ajouter des optimisations si elles ne sont pas présentes
  if (!currentConfig.includes('compress: true')) {
    const optimizedConfig = `import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  
  // Configuration des images
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Configuration expérimentale
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;`;

    writeFileSync(nextConfigPath, optimizedConfig);
    console.log('  ✅ next.config.ts optimisé');
  } else {
    console.log('  ✅ next.config.ts déjà optimisé');
  }
}

// 2. Créer un .gitignore optimisé si nécessaire
console.log('\n📝 Vérification de .gitignore...');
const gitignorePath = '.gitignore';
const requiredIgnores = [
  '.env.local',
  '.env*.local',
  '.vercel',
  'uploads/*',
  '!uploads/.gitkeep',
  'prisma/dev.db*',
  '.railway',
  'fly.toml',
  'render.yaml'
];

if (existsSync(gitignorePath)) {
  let gitignore = readFileSync(gitignorePath, 'utf8');
  let updated = false;
  
  requiredIgnores.forEach(ignore => {
    if (!gitignore.includes(ignore)) {
      gitignore += `\n${ignore}`;
      updated = true;
    }
  });
  
  if (updated) {
    writeFileSync(gitignorePath, gitignore);
    console.log('  ✅ .gitignore mis à jour');
  } else {
    console.log('  ✅ .gitignore déjà configuré');
  }
}

// 3. Créer un fichier .gitkeep pour le dossier uploads
console.log('\n📁 Configuration du dossier uploads...');
const uploadsKeep = 'uploads/.gitkeep';
if (!existsSync('uploads')) {
  execSync('mkdir -p uploads');
}
if (!existsSync(uploadsKeep)) {
  writeFileSync(uploadsKeep, '# Ce fichier maintient le dossier uploads dans Git\n');
  console.log('  ✅ .gitkeep créé pour uploads/');
} else {
  console.log('  ✅ uploads/.gitkeep déjà présent');
}

// 4. Optimiser les scripts de package.json pour la production
console.log('\n📦 Vérification des scripts de production...');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

const productionOptimizations = {
  'build:prod': 'NODE_ENV=production next build',
  'start:prod': 'NODE_ENV=production next start -p $PORT',
  'postbuild': 'npm run db:generate'
};

let scriptsUpdated = false;
Object.entries(productionOptimizations).forEach(([key, value]) => {
  if (!packageJson.scripts[key]) {
    packageJson.scripts[key] = value;
    scriptsUpdated = true;
    console.log(`  ✅ Script "${key}" ajouté`);
  }
});

if (scriptsUpdated) {
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('  📦 package.json mis à jour');
} else {
  console.log('  ✅ Scripts déjà optimisés');
}

// 5. Créer un healthcheck endpoint si pas présent
console.log('\n🏥 Vérification du healthcheck...');
const healthcheckPath = 'src/app/api/health/route.ts';
if (!existsSync(healthcheckPath)) {
  const healthcheckCode = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Vérifier la connexion à la base de données
    const { db } = await import('@/lib/db');
    await db.$queryRaw\`SELECT 1\`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      },
      { status: 503 }
    );
  }
}`;

  execSync('mkdir -p src/app/api/health');
  writeFileSync(healthcheckPath, healthcheckCode);
  console.log('  ✅ Endpoint healthcheck créé');
} else {
  console.log('  ✅ Healthcheck déjà présent');
}

console.log('\n🎉 Configuration de production terminée !');
console.log('\n📋 Résumé des optimisations :');
console.log('  • next.config.ts optimisé avec compression et headers de sécurité');
console.log('  • .gitignore configuré pour ignorer les fichiers sensibles');
console.log('  • Dossier uploads préparé avec .gitkeep');
console.log('  • Scripts de production ajoutés');
console.log('  • Endpoint de healthcheck créé (/api/health)');
console.log('\n🚀 Prêt pour le déploiement ! Utilisez : npm run pre-deploy');
