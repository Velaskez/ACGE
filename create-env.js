const fs = require('fs');

// Informations du projet Supabase
const PROJECT_REF = 'wodyrsasfqfoqdydrfew';
const DB_HOST = 'aws-0-eu-west-3.pooler.supabase.com';
const DB_PASSWORD = 'Reviti2025@';

// URLs de connexion
const DATABASE_URL = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:6543/postgres`;
const DIRECT_URL = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:5432/postgres`;

// Contenu du fichier .env
const envContent = `DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DIRECT_URL}"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"
`;

// Écrire le fichier .env
fs.writeFileSync('.env', envContent);

console.log('✅ Fichier .env créé avec succès !');
console.log('📊 URLs de connexion :');
console.log(`DATABASE_URL: ${DATABASE_URL}`);
console.log(`DIRECT_URL: ${DIRECT_URL}`);
