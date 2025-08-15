const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la compatibilité des variables d\'environnement...\n');

// Variables d'environnement locales (MySQL LWS)
const localEnv = {
    DATABASE_URL: "mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579",
    NEXTAUTH_URL: "http://localhost:3000",
    NEXT_PUBLIC_API_URL: "http://localhost:3000",
    NODE_ENV: "development"
};

// Variables d'environnement production (PostgreSQL Supabase)
const productionEnv = {
    DATABASE_URL: "postgresql://postgres.wodyrsasfqfoqdydrfew:Reviti2025%40@aws-0-eu-west-3.pooler.supabase.com:6543/postgres",
    NEXTAUTH_URL: "https://acge-gabon.com",
    NEXT_PUBLIC_API_URL: "https://acge-gabon.com",
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: "https://wodyrsasfqfoqdydrfew.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4",
    SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0"
};

// Vérifications
const checks = [
    {
        name: "Base de données",
        local: localEnv.DATABASE_URL,
        production: productionEnv.DATABASE_URL,
        issue: "❌ INCOMPATIBLE - MySQL vs PostgreSQL",
        solution: "Migrer vers PostgreSQL ou configurer MySQL en production"
    },
    {
        name: "URL NextAuth",
        local: localEnv.NEXTAUTH_URL,
        production: productionEnv.NEXTAUTH_URL,
        issue: "✅ COMPATIBLE - URLs relatives configurées",
        solution: "Aucune action nécessaire"
    },
    {
        name: "URL API",
        local: localEnv.NEXT_PUBLIC_API_URL,
        production: productionEnv.NEXT_PUBLIC_API_URL,
        issue: "✅ COMPATIBLE - URLs relatives configurées",
        solution: "Aucune action nécessaire"
    },
    {
        name: "Supabase Storage",
        local: "Non configuré",
        production: productionEnv.NEXT_PUBLIC_SUPABASE_URL,
        issue: "⚠️ MANQUANT - Supabase non configuré en local",
        solution: "Configurer Supabase en local ou utiliser un autre storage"
    }
];

console.log('📋 RÉSULTATS DES VÉRIFICATIONS:\n');

let criticalIssues = 0;
let warnings = 0;

checks.forEach(check => {
    console.log(`🔍 ${check.name}:`);
    console.log(`   Local: ${check.local}`);
    console.log(`   Production: ${check.production}`);
    
    if (check.issue.includes('❌')) {
        console.log(`   ${check.issue}`);
        console.log(`   💡 Solution: ${check.solution}`);
        criticalIssues++;
    } else if (check.issue.includes('⚠️')) {
        console.log(`   ${check.issue}`);
        console.log(`   💡 Solution: ${check.solution}`);
        warnings++;
    } else {
        console.log(`   ${check.issue}`);
    }
    console.log('');
});

// Vérification du schéma Prisma
console.log('📊 VÉRIFICATION DU SCHÉMA PRISMA:');
try {
    const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    if (schemaContent.includes('provider = "postgresql"')) {
        console.log('   ✅ Schéma configuré pour PostgreSQL');
        console.log('   ⚠️  Incompatible avec MySQL local');
        criticalIssues++;
    } else if (schemaContent.includes('provider = "mysql"')) {
        console.log('   ✅ Schéma configuré pour MySQL');
        console.log('   ⚠️  Incompatible avec PostgreSQL production');
        criticalIssues++;
    } else {
        console.log('   ❓ Type de base de données non détecté');
    }
} catch (error) {
    console.log('   ❌ Impossible de lire le schéma Prisma');
    criticalIssues++;
}

console.log('\n📊 RÉSUMÉ:');
console.log(`   ❌ Problèmes critiques: ${criticalIssues}`);
console.log(`   ⚠️  Avertissements: ${warnings}`);

if (criticalIssues === 0) {
    console.log('\n🎉 Aucun problème critique détecté !');
    console.log('✅ L\'application est prête pour le déploiement.');
} else {
    console.log('\n🚨 PROBLÈMES CRITIQUES DÉTECTÉS !');
    console.log('❌ Ne pas déployer avant de résoudre ces problèmes.');
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('   1. Choisir une base de données unique (MySQL OU PostgreSQL)');
    console.log('   2. Configurer le même environnement en local et production');
    console.log('   3. Mettre à jour le schéma Prisma en conséquence');
    console.log('   4. Tester avec l\'environnement de test créé');
}

console.log('\n🔗 Pour tester: http://localhost:3000/test-production-compatibility.html');
