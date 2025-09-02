const { execSync } = require('child_process');

console.log('🚀 Configuration automatique Supabase...');

// Informations du projet Supabase
const PROJECT_REF = 'wodyrsasfqfoqdydrfew';
const DB_HOST = 'aws-0-eu-west-3.pooler.supabase.com';
const DB_PASSWORD = 'Reviti2025@';

// URLs de connexion
const DATABASE_URL = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:6543/postgres`;
const DIRECT_URL = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:5432/postgres`;

console.log('📊 URLs de connexion générées:');
console.log(`DATABASE_URL: ${DATABASE_URL}`);
console.log(`DIRECT_URL: ${DIRECT_URL}`);

// Configuration pour Vercel
console.log('\n🔧 Configuration pour Vercel:');
console.log('Ajoutez ces variables d\'environnement dans votre projet Vercel:');
console.log('');
console.log(`DATABASE_URL="${DATABASE_URL}"`);
console.log(`DIRECT_URL="${DIRECT_URL}"`);
console.log('NEXTAUTH_URL="https://acge-gabon.com"');
console.log('NEXTAUTH_SECRET="votre_secret_production_securise_changez_ceci"');
console.log('NEXT_PUBLIC_API_URL="https://acge-gabon.com"');
console.log('');

// Test de connexion
console.log('🧪 Test de connexion à Supabase...');
try {
  const { PrismaClient } = require('@prisma/client');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DIRECT_URL,
      },
    },
  });

  prisma.$connect()
    .then(async () => {
      console.log('✅ Connexion directe à Supabase réussie');
      
      const naturesCount = await prisma.natureDocument.count();
      const postesCount = await prisma.posteComptable.count();
      
      console.log(`📊 Natures de documents: ${naturesCount}`);
      console.log(`📊 Postes comptables: ${postesCount}`);
      
      await prisma.$disconnect();
      console.log('✅ Test de connexion terminé avec succès');
    })
    .catch((error) => {
      console.error('❌ Erreur de connexion:', error.message);
    });
} catch (error) {
  console.error('❌ Erreur lors du test:', error.message);
}
