const fs = require('fs');

// URLs de connexion simplifiées
const DATABASE_URL = "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:6543/postgres";
const DIRECT_URL = "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:5432/postgres";

// Contenu du fichier .env
const envContent = `DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DIRECT_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"`;

// Écrire le fichier .env
fs.writeFileSync('.env', envContent);

console.log('✅ Fichier .env créé avec succès !');
console.log('📊 URLs de connexion :');
console.log(`DATABASE_URL: ${DATABASE_URL}`);
console.log(`DIRECT_URL: ${DIRECT_URL}`);
