const { PrismaClient } = require('@prisma/client');

// URL de base de données Supabase directe (port 5432)
const DIRECT_URL = "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DIRECT_URL,
    },
  },
  log: ['error', 'warn'],
});

async function testDirectConnection() {
  try {
    console.log('🔍 Test de connexion directe à Supabase...');
    
    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion directe à Supabase réussie');

    // Test des tables comptables
    const naturesCount = await prisma.natureDocument.count();
    const postesCount = await prisma.posteComptable.count();
    
    console.log(`📊 Natures de documents: ${naturesCount}`);
    console.log(`📊 Postes comptables: ${postesCount}`);

    // Test des données
    const natures = await prisma.natureDocument.findMany({
      take: 3,
      orderBy: { numero: 'asc' }
    });

    const postes = await prisma.posteComptable.findMany({
      take: 3,
      orderBy: { numero: 'asc' }
    });

    console.log('\n📄 Premières natures de documents:');
    natures.forEach(nature => {
      console.log(`  - ${nature.numero}: ${nature.nom}`);
    });

    console.log('\n📊 Premiers postes comptables:');
    postes.forEach(poste => {
      console.log(`  - ${poste.numero}: ${poste.intitule}`);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion directe à Supabase:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectConnection();
