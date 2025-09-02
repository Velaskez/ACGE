const { PrismaClient } = require('@prisma/client');

console.log('🧪 Test de connexion Supabase avec npm...');

// Utiliser les variables d'environnement du fichier .env
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔗 Tentative de connexion...');
    await prisma.$connect();
    console.log('✅ Connexion réussie !');
    
    // Test des tables comptables
    const naturesCount = await prisma.natureDocument.count();
    const postesCount = await prisma.posteComptable.count();
    
    console.log(`📊 Natures de documents: ${naturesCount}`);
    console.log(`📊 Postes comptables: ${postesCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Test terminé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testConnection();
