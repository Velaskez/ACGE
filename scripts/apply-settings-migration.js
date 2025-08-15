const { execSync } = require('child_process');

try {
  console.log('🔄 Application de la migration Prisma pour le champ settings...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  console.log('✅ Migration appliquée avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
  process.exit(1);
}
