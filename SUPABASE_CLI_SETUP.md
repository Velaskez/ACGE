# 🚀 CONFIGURATION SUPABASE AVEC LE CLI

## 📋 État actuel
- ✅ Supabase CLI disponible (v2.34.3)
- ✅ Projet Supabase initialisé localement
- ⏳ Connexion et création du projet cloud

## 🔧 ÉTAPES DE CONFIGURATION

### 1️⃣ Se connecter à Supabase
```bash
# Obtenir un token d'accès depuis le dashboard
# 1. Aller sur https://supabase.com/dashboard/account/tokens
# 2. Créer un nouveau token
# 3. Copier le token

# Se connecter avec le token
npx supabase login
# Coller le token quand demandé
```

### 2️⃣ Créer le projet Supabase
```bash
# Option A : Créer un nouveau projet via CLI
npx supabase projects create acge-gabon --org-id YOUR_ORG_ID --region eu-west-1

# Option B : Lier à un projet existant
npx supabase link --project-ref YOUR_PROJECT_REF
```

### 3️⃣ Configurer les variables d'environnement
```bash
# Récupérer les informations du projet
npx supabase status

# Créer le fichier .env.local avec les valeurs
cp .env.supabase.example .env.local
# Éditer et remplacer les placeholders
```

### 4️⃣ Appliquer le schéma Prisma
```bash
# Copier le schéma PostgreSQL
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Générer le client Prisma
npx prisma generate

# Pousser le schéma vers Supabase
npx prisma db push
```

### 5️⃣ Désactiver RLS pour Prisma
```bash
# Exécuter les commandes SQL via le CLI
npx supabase db execute --sql "ALTER TABLE users DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE documents DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE folders DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE tags DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE document_shares DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE document_versions DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE comments DISABLE ROW LEVEL SECURITY;"
npx supabase db execute --sql "ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;"
```

### 6️⃣ Migrer les données
```bash
# Exécuter le script de migration
npx tsx scripts/migrate-to-supabase.ts

# Vérifier avec Prisma Studio
npx prisma studio
```

## 🛠️ COMMANDES UTILES SUPABASE CLI

```bash
# Statut du projet
npx supabase status

# Lancer Supabase en local (pour tests)
npx supabase start

# Arrêter Supabase local
npx supabase stop

# Voir les logs
npx supabase db logs

# Exécuter du SQL
npx supabase db execute --sql "SELECT * FROM users;"

# Générer les types TypeScript
npx supabase gen types typescript --local > src/types/supabase.ts

# Push des migrations
npx supabase db push

# Reset de la base
npx supabase db reset
```

## 📝 WORKFLOW RECOMMANDÉ

1. **Développement local**
   ```bash
   npx supabase start  # Lance PostgreSQL local
   npm run dev         # Lance Next.js
   ```

2. **Test des changements**
   ```bash
   npx prisma db push  # Applique le schéma
   npx prisma studio   # Vérifie les données
   ```

3. **Déploiement production**
   ```bash
   npx supabase db push --linked  # Push vers le cloud
   git push                        # Déploie sur Vercel
   ```

## ⚡ AVANTAGES DU CLI

- ✅ Développement local avec Docker
- ✅ Migrations versionnées
- ✅ Types TypeScript auto-générés
- ✅ Sync facile local ↔ cloud
- ✅ Gestion des secrets sécurisée

## 🔒 SÉCURITÉ

Pour la production, assurez-vous de :
1. Ne jamais commiter les tokens d'accès
2. Utiliser des variables d'environnement
3. Activer RLS après tests (si nécessaire)
4. Limiter les permissions des tokens

## 🆘 DÉPANNAGE

### Problème de connexion
```bash
# Vérifier le token
npx supabase projects list

# Re-login si nécessaire
npx supabase logout
npx supabase login
```

### Base de données non accessible
```bash
# Vérifier le statut
npx supabase status

# Redémarrer si local
npx supabase stop
npx supabase start
```

### Erreur de permissions
```bash
# Donner tous les droits (dev only!)
npx supabase db execute --sql "GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;"
```

---

**Prochaine étape** : Exécuter les commandes ci-dessus dans l'ordre pour configurer votre projet Supabase.
