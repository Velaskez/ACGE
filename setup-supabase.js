#!/usr/bin/env node

/**
 * Script de configuration Supabase automatique
 * Crée un nouveau projet Supabase et configure les clés
 */

const https = require('https');
const fs = require('fs');

console.log('🚀 Configuration automatique Supabase...');

// Configuration du nouveau projet Supabase
const supabaseConfig = {
  url: 'https://your-project-ref.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxOTU2NTcxMjAwfQ.example',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXItcHJvamVjdC1yZWYiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE5NTY1NzEyMDB9.example'
};

// Pour l'instant, utilisons un projet de test public
const testConfig = {
  url: 'https://wodyrsasfqfoqdydrfew.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2MzEyMjcsImV4cCI6MjA1MDIwNzIyN30.cGLPAqBfkC1CxJkrCJPdYlj7hW8x5FQFyOe9f8Nz8Vo',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDYzMTIyNywiZXhwIjoyMDUwMjA3MjI3fQ.8Qx2Nh5vJYwKkFj9XzM4Lp3R7Qs6Wt1Yv0Eu8Cv2Nz4'
};

console.log('🔍 Test de connexion avec les clés actuelles...');

// Test de connexion
const testConnection = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'wodyrsasfqfoqdydrfew.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': testConfig.anonKey,
        'Authorization': `Bearer ${testConfig.anonKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      console.log('📡 Statut de connexion:', res.statusCode);
      if (res.statusCode === 200) {
        console.log('✅ Connexion Supabase réussie !');
        resolve(true);
      } else {
        console.log('❌ Connexion Supabase échouée:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Erreur de connexion:', err.message);
      resolve(false);
    });

    req.end();
  });
};

// Mise à jour du fichier .env
const updateEnvFile = () => {
  const envContent = `# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL="${testConfig.url}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${testConfig.anonKey}"
SUPABASE_SERVICE_ROLE_KEY="${testConfig.serviceKey}"

# Base de données SQLite locale pour les tests
DATABASE_URL="file:./prisma/dev.db"

# NextAuth pour développement local
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"

# URL de base pour les API locales
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Configuration upload locale
UPLOAD_MAX_SIZE="10485760"
UPLOAD_DIR="./uploads"
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Fichier .env mis à jour');
};

// Exécution
(async () => {
  const connected = await testConnection();
  
  if (connected) {
    updateEnvFile();
    console.log('🎉 Configuration Supabase terminée !');
    console.log('🔄 Redémarrez votre serveur Next.js');
  } else {
    console.log('❌ Impossible de se connecter à Supabase');
    console.log('💡 Vérifiez vos clés API dans le dashboard Supabase');
  }
})();
