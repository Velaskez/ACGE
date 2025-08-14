# 🚀 GUIDE DE MIGRATION VERS SUPABASE - ACGE

## 📋 ÉTAT ACTUEL
- ✅ Schéma PostgreSQL préparé (`prisma/schema.postgresql.prisma`)
- ⏳ Compte Supabase à créer
- ⏳ Migration des données MySQL → PostgreSQL

## 🔧 ÉTAPE 1 : CRÉER LE PROJET SUPABASE

### 1.1 Créer un compte Supabase
1. Aller sur https://supabase.com
2. Cliquer sur "Start your project"
3. Se connecter avec GitHub (recommandé) ou créer un compte

### 1.2 Créer un nouveau projet
1. Cliquer sur "New Project"
2. Remplir les informations :
   - **Project name**: `acge-gabon`
   - **Database Password**: [Générer un mot de passe fort et le sauvegarder]
   - **Region**: `West EU (Ireland)` ou `Central EU (Frankfurt)`
   - **Pricing Plan**: Free tier (suffisant pour commencer)

### 1.3 Récupérer les informations de connexion
Une fois le projet créé (environ 2 minutes), aller dans :
1. **Settings** → **Database**
2. Noter les informations suivantes :

```env
# Connection string pour Prisma (Transaction mode)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Connection string directe (pour les migrations)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Variables Supabase (pour l'API si nécessaire)
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

## 🔄 ÉTAPE 2 : CONFIGURATION PRISMA

### 2.1 Créer le fichier .env.local
```bash
# Copier les variables récupérées de Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 2.2 Remplacer le schéma Prisma
```bash
# Sauvegarder l'ancien schéma
cp prisma/schema.prisma prisma/schema.mysql.backup.prisma

# Utiliser le nouveau schéma PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

### 2.3 Mettre à jour le schéma pour utiliser DIRECT_URL pour les migrations
Modifier `prisma/schema.prisma` :
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Ajouter cette ligne
}
```

### 2.4 Générer et pousser le schéma
```bash
# Installer les dépendances si nécessaire
npm install

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers Supabase
npx prisma db push

# Vérifier avec Prisma Studio
npx prisma studio
```

## 📦 ÉTAPE 3 : MIGRATION DES DONNÉES

### 3.1 Exporter les données MySQL depuis LWS
1. Se connecter à phpMyAdmin LWS
2. Sélectionner la base de données
3. Exporter en format SQL ou CSV
4. Télécharger le fichier

### 3.2 Script de migration des données
Créer `scripts/migrate-to-supabase.ts` :
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function migrate() {
  // 1. Créer l'utilisateur admin
  const hashedPassword = await bcrypt.hash('Admin@2024', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@acge-gabon.com',
      password: hashedPassword,
      name: 'Administrateur ACGE',
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin créé avec succès')
  
  // 2. Importer d'autres données si nécessaire
  // ...
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Exécuter :
```bash
npx tsx scripts/migrate-to-supabase.ts
```

## 🚀 ÉTAPE 4 : DÉPLOIEMENT SUR VERCEL

### 4.1 Configurer les variables d'environnement sur Vercel
1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet `acge-gabon`
3. Settings → Environment Variables
4. Ajouter :
   - `DATABASE_URL` (connection poolée)
   - `DIRECT_URL` (connection directe)
   - `NEXTAUTH_URL=https://acge-gabon.com`
   - `NEXTAUTH_SECRET` (garder l'existant)

### 4.2 Redéployer
```bash
# Pousser les changements
git add .
git commit -m "Migration vers Supabase PostgreSQL"
git push

# Vercel va automatiquement redéployer
```

## ✅ ÉTAPE 5 : TESTS ET VALIDATION

### 5.1 Tests locaux
```bash
# Tester en local
npm run dev

# Vérifier :
- Connexion admin : http://localhost:3000/login
- Dashboard : http://localhost:3000/dashboard
- Upload : http://localhost:3000/upload
```

### 5.2 Tests en production
```bash
# Après déploiement, tester :
- https://acge-gabon.com/login
- https://acge-gabon.com/admin-setup
- https://acge-gabon.com/dashboard
```

### 5.3 Monitoring Supabase
1. Dashboard Supabase → Database → Tables
2. Vérifier que toutes les tables sont créées
3. Vérifier les données importées
4. Activer les logs si nécessaire

## 🛠️ COMMANDES UTILES

```bash
# Réinitialiser la base de données
npx prisma migrate reset

# Voir le schéma SQL généré
npx prisma migrate diff

# Ouvrir Prisma Studio
npx prisma studio

# Vérifier la connexion
npx prisma db pull
```

## 🔒 SÉCURITÉ

### Row Level Security (RLS)
Supabase active RLS par défaut. Pour Prisma, nous devons :
1. Utiliser un utilisateur avec les droits appropriés
2. OU désactiver RLS temporairement pour les tables gérées par Prisma

```sql
-- Désactiver RLS pour les tables Prisma (dans Supabase SQL Editor)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE folders DISABLE ROW LEVEL SECURITY;
-- etc...
```

## 📝 NOTES IMPORTANTES

1. **Connection Pooling** : Utiliser `DATABASE_URL` (avec pgbouncer) dans l'application
2. **Migrations** : Utiliser `DIRECT_URL` pour les migrations Prisma
3. **Limite de connexions** : Le plan gratuit limite à 60 connexions
4. **Stockage** : 500MB gratuit (suffisant pour les métadonnées)
5. **Fichiers** : Continuer à stocker sur LWS, seules les métadonnées dans Supabase

## 🆘 DÉPANNAGE

### Erreur de connexion
```bash
# Vérifier les variables d'environnement
node -e "console.log(process.env.DATABASE_URL)"

# Tester la connexion
npx prisma db pull
```

### Tables non créées
```bash
# Forcer la création
npx prisma db push --force-reset
```

### Problème de permissions
```sql
-- Dans Supabase SQL Editor
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

## ✨ AVANTAGES DE SUPABASE

- ✅ **PostgreSQL** : Base de données robuste et performante
- ✅ **Gratuit** : 500MB de stockage, 2GB de bande passante
- ✅ **API REST** : Automatiquement générée (optionnel)
- ✅ **Realtime** : Websockets intégrés (optionnel)
- ✅ **Auth** : Système d'authentification intégré (optionnel)
- ✅ **Compatible Vercel** : Intégration parfaite
- ✅ **Prisma** : Support natif PostgreSQL

## 🎯 PROCHAINES ÉTAPES

1. Créer le compte Supabase maintenant
2. Suivre les étapes ci-dessus
3. Tester localement
4. Déployer sur Vercel
5. Valider en production

---

**Support** : En cas de problème, consulter :
- Documentation Supabase : https://supabase.com/docs
- Documentation Prisma : https://www.prisma.io/docs
- Support Vercel : https://vercel.com/docs
