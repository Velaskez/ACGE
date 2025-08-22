const { PrismaClient } = require('@prisma/client');

const urls = [
  "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@db.wodyrsasfqfoqdydrfew.supabase.co:5432/postgres",
  "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
];

async function testUrl(url, index) {
  console.log(`\n🔍 Test URL ${index + 1}: ${url.substring(0, 50)}...`);
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });
  
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log(`✅ URL ${index + 1} fonctionne:`, result);
    
    const userCount = await prisma.user.count();
    console.log(`✅ Utilisateurs: ${userCount}`);
    
    return true;
  } catch (error) {
    console.log(`❌ URL ${index + 1} échoue:`, error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function testAllUrls() {
  console.log('🧪 Test de toutes les URLs de connexion...\n');
  
  for (let i = 0; i < urls.length; i++) {
    const success = await testUrl(urls[i], i);
    if (success) {
      console.log(`\n🎉 URL ${i + 1} fonctionne ! Utilisez cette URL.`);
      return urls[i];
    }
  }
  
  console.log('\n❌ Aucune URL ne fonctionne.');
  return null;
}

testAllUrls();
