#!/usr/bin/env node

const fs = require('fs');

console.log('🔑 Mise à jour des clés Supabase...');

// Nouvelles clés fournies par l'utilisateur
const newAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4";
const newServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0";

// Mettre à jour .env.local
try {
  let envLocalContent = fs.readFileSync('.env.local', 'utf8');
  
  // Remplacer les anciennes clés
  envLocalContent = envLocalContent.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY="[^"]*"/g,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY="${newAnonKey}"`
  );
  
  envLocalContent = envLocalContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY="[^"]*"/g,
    `SUPABASE_SERVICE_ROLE_KEY="${newServiceKey}"`
  );
  
  fs.writeFileSync('.env.local', envLocalContent);
  console.log('✅ .env.local mis à jour');
} catch (error) {
  console.log('❌ Erreur .env.local:', error.message);
}

// Mettre à jour .env
try {
  let envContent = fs.readFileSync('.env', 'utf8');
  
  // Remplacer les anciennes clés
  envContent = envContent.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY="[^"]*"/g,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY="${newAnonKey}"`
  );
  
  envContent = envContent.replace(
    /SUPABASE_SERVICE_ROLE_KEY="[^"]*"/g,
    `SUPABASE_SERVICE_ROLE_KEY="${newServiceKey}"`
  );
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env mis à jour');
} catch (error) {
  console.log('❌ Erreur .env:', error.message);
}

console.log('🎉 Clés Supabase mises à jour !');
console.log('🔄 Redémarrez votre serveur Next.js');
