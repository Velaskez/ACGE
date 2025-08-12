// Script pour configurer correctement les migrations Prisma
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

async function setupPrismaMigrations() {
  console.log('🔄 Configuration des migrations Prisma\n')
  
  try {
    // 1. Vérifier que la base de données est accessible
    console.log('1. 🔍 Vérification de la connexion à la base de données...')
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe' })
      console.log('   ✅ Connexion OK')
    } catch (error) {
      console.log('   ❌ Problème de connexion')
      console.log('   💡 Démarrez Docker : docker-compose up -d')
      return
    }
    
    // 2. Initialiser les migrations si elles n'existent pas
    console.log('\n2. 📁 Configuration du dossier migrations...')
    const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations')
    
    if (!fs.existsSync(migrationsPath)) {
      console.log('   📝 Initialisation des migrations...')
      execSync('npx prisma migrate dev --name "init-schema" --create-only', { stdio: 'inherit' })
      console.log('   ✅ Migrations initialisées')
    } else {
      console.log('   ✅ Dossier migrations existe déjà')
    }
    
    // 3. Créer un script de migration de base
    console.log('\n3. 📜 Création des scripts de migration...')
    
    // Script de migration rapide
    const quickMigrateScript = `@echo off
echo 🔄 Migration rapide Prisma...
npx prisma migrate dev --name "quick-update"
echo ✅ Migration terminée !
pause`
    
    fs.writeFileSync('scripts/quick-migrate.bat', quickMigrateScript)
    console.log('   ✅ Script quick-migrate.bat créé')
    
    // Script de reset sécurisé
    const resetScript = `@echo off
echo ⚠️  ATTENTION: Cette action va réinitialiser la base de données !
echo Toutes les données seront perdues.
set /p confirm="Êtes-vous sûr ? (o/N): "
if /i "%confirm%"=="o" (
    echo 🔄 Reset de la base de données...
    npx prisma migrate reset --force
    echo ✅ Reset terminé !
) else (
    echo ❌ Opération annulée.
)
pause`
    
    fs.writeFileSync('scripts/reset-database.bat', resetScript)
    console.log('   ✅ Script reset-database.bat créé')
    
    // 4. Créer un guide des bonnes pratiques
    console.log('\n4. 📖 Création du guide des migrations...')
    
    const migrationsGuide = `# 📖 Guide des Migrations Prisma - ACGE

## 🚀 Commandes essentielles

### Développement quotidien
\`\`\`bash
# 1. Après modification du schema.prisma
npx prisma migrate dev --name "description-du-changement"

# 2. Pour synchroniser rapidement (development seulement)
npx prisma db push

# 3. Générer le client Prisma après changements
npx prisma generate
\`\`\`

### Production
\`\`\`bash
# Appliquer les migrations en production
npx prisma migrate deploy
\`\`\`

## 🔧 Scripts rapides disponibles

- \`scripts/quick-migrate.bat\` - Migration rapide
- \`scripts/reset-database.bat\` - Reset sécurisé (dev seulement)

## ⚠️ Bonnes pratiques

1. **Toujours nommer vos migrations** :
   \`\`\`bash
   npx prisma migrate dev --name "add-comments-table"
   npx prisma migrate dev --name "update-user-roles"
   \`\`\`

2. **Tester avant déploiement** :
   - Testez vos migrations sur une copie de prod
   - Vérifiez que toutes les données sont préservées

3. **En cas d'erreur de schéma** :
   \`\`\`bash
   # Option 1: Reset complet (développement)
   npx prisma migrate reset

   # Option 2: Push forcé (développement)
   npx prisma db push --force-reset
   \`\`\`

## 🚫 À éviter

- ❌ Modifier directement la base de données
- ❌ Utiliser \`db push\` en production
- ❌ Supprimer des fichiers de migration
- ❌ Modifier des migrations déjà appliquées

## 🆘 En cas de problème

1. Vérifiez que Docker est démarré
2. Vérifiez votre .env.local
3. Relancez \`npx prisma generate\`
4. En dernier recours : \`npx prisma migrate reset\`
`
    
    fs.writeFileSync('docs/MIGRATIONS_GUIDE.md', migrationsGuide)
    console.log('   ✅ Guide docs/MIGRATIONS_GUIDE.md créé')
    
    console.log('\n🎉 Configuration des migrations terminée !')
    console.log('\n📋 Fichiers créés :')
    console.log('   📁 scripts/quick-migrate.bat')
    console.log('   📁 scripts/reset-database.bat') 
    console.log('   📁 docs/MIGRATIONS_GUIDE.md')
    
    console.log('\n💡 Prochaines étapes :')
    console.log('   1. Lisez docs/MIGRATIONS_GUIDE.md')
    console.log('   2. Utilisez scripts/quick-migrate.bat pour les mises à jour')
    console.log('   3. Toujours nommer vos migrations !')
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration des migrations:', error)
    process.exit(1)
  }
}

setupPrismaMigrations().catch(console.error)
