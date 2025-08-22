require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');

async function testComptableTables() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('🔍 Test des tables comptables...');
    
    // Test des postes comptables
    console.log('\n📋 Test des postes comptables...');
    const postesComptables = await prisma.posteComptable.findMany();
    console.log(`✅ Postes comptables trouvés: ${postesComptables.length}`);
    postesComptables.forEach(pc => {
      console.log(`  - ${pc.numero}: ${pc.intitule}`);
    });
    
    // Test des natures de documents
    console.log('\n📋 Test des natures de documents...');
    const naturesDocuments = await prisma.natureDocument.findMany();
    console.log(`✅ Natures de documents trouvées: ${naturesDocuments.length}`);
    naturesDocuments.forEach(nd => {
      console.log(`  - ${nd.numero}: ${nd.nom}`);
    });
    
    // Test des dossiers
    console.log('\n📋 Test des dossiers...');
    const dossiers = await prisma.dossier.findMany();
    console.log(`✅ Dossiers trouvés: ${dossiers.length}`);
    
    // Test des validations de dossiers
    console.log('\n📋 Test des validations de dossiers...');
    const validations = await prisma.validationDossier.findMany();
    console.log(`✅ Validations trouvées: ${validations.length}`);
    
    // Test des paramètres utilisateur
    console.log('\n📋 Test des paramètres utilisateur...');
    const userSettings = await prisma.userSettings.findMany();
    console.log(`✅ Paramètres utilisateur trouvés: ${userSettings.length}`);
    
    console.log('\n🎉 Toutes les tables comptables fonctionnent correctement !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test des tables comptables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testComptableTables();
