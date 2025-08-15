require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('🔍 Test de connexion à Supabase...');
    console.log('URL:', process.env.DATABASE_URL ? 'Définie' : 'Non définie');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connexion réussie:', result);
    
    const userCount = await prisma.user.count();
    console.log('✅ Nombre d\'utilisateurs:', userCount);
    
    const documentCount = await prisma.document.count();
    console.log('✅ Nombre de documents:', documentCount);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
