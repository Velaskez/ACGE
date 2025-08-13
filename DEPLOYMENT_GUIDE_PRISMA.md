# 🚀 Guide de Déploiement ACGE avec Prisma

## 📋 Vue d'ensemble

Ce guide explique comment déployer l'application ACGE sur Vercel en utilisant **Prisma + PostgreSQL** sans Supabase.

## 🗄️ Configuration de la Base de Données

### Option 1: PostgreSQL Cloud (Recommandé)

#### Neon.tech (Gratuit)
1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte et un nouveau projet
3. Récupérer l'URL de connexion PostgreSQL
4. Format: `postgresql://user:password@hostname:port/database`

#### Railway (Gratuit)
1. Aller sur [railway.app](https://railway.app)
2. Créer un compte et un nouveau projet
3. Ajouter un service PostgreSQL
4. Récupérer l'URL de connexion

#### PlanetScale (Gratuit)
1. Aller sur [planetscale.com](https://planetscale.com)
2. Créer un compte et une base de données
3. Récupérer l'URL de connexion

### Option 2: PostgreSQL Local (Développement)
```bash
# Démarrer PostgreSQL avec Docker
docker-compose up -d

# URL de connexion locale
DATABASE_URL="postgresql://acge_user:acge_password_dev@localhost:5433/acge_database"
```

## 🌐 Déploiement sur Vercel

### 1. Préparation du Projet

```bash
# Cloner le projet
git clone https://github.com/Velaskez/ACGE.git
cd ACGE

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate
```

### 2. Configuration des Variables d'Environnement

Sur Vercel, configurer les variables suivantes :

```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-app.vercel.app"

# API publique
NEXT_PUBLIC_API_URL="https://your-app.vercel.app"
```

### 3. Déploiement

```bash
# Pousser le schéma vers la base de données
npx prisma db push

# Construire l'application
npm run build

# Déployer sur Vercel
vercel --prod
```

### 4. Configuration Post-Déploiement

```bash
# Créer l'utilisateur admin
npm run setup:prisma-prod
```

## 🔧 Scripts Utiles

```bash
# Configuration Prisma pour la production
npm run setup:prisma-prod

# Générer le client Prisma
npm run db:generate

# Pousser le schéma
npm run db:push

# Studio Prisma (développement)
npm run db:studio
```

## 📊 Vérification du Déploiement

### 1. Test de l'API Health
```bash
curl https://your-app.vercel.app/api/health
```

### 2. Test de l'Authentification
```bash
# Login
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acge.ga","password":"admin123"}'
```

### 3. Test de l'Utilisateur
```bash
# Vérifier l'utilisateur connecté
curl https://your-app.vercel.app/api/auth/me \
  -H "Cookie: auth-token=your-token-here"
```

## 🔑 Informations de Connexion

- **URL de l'application**: https://your-app.vercel.app
- **Email admin**: admin@acge.ga
- **Mot de passe admin**: admin123

## 🛠️ Dépannage

### Problème de Connexion à la Base de Données
1. Vérifier l'URL DATABASE_URL
2. S'assurer que la base est accessible depuis Vercel
3. Vérifier les permissions de l'utilisateur

### Problème d'Authentification
1. Vérifier NEXTAUTH_SECRET
2. Vérifier NEXTAUTH_URL
3. S'assurer que l'utilisateur admin existe

### Problème de Build
1. Vérifier que Prisma est généré : `npx prisma generate`
2. Vérifier les variables d'environnement
3. Consulter les logs de build Vercel

## 📝 Notes Importantes

- ✅ **Plus de Supabase** : Configuration simplifiée
- ✅ **Prisma uniquement** : Gestion directe de PostgreSQL
- ✅ **Stockage local** : Fichiers stockés localement
- ✅ **Authentification JWT** : Sessions sécurisées
- ✅ **Déploiement Vercel** : Optimisé pour le cloud

## 🎯 Avantages de cette Configuration

1. **Simplicité** : Moins de dépendances externes
2. **Performance** : Connexion directe à PostgreSQL
3. **Contrôle** : Gestion complète de la base de données
4. **Coût** : Utilisation de services PostgreSQL gratuits
5. **Flexibilité** : Possibilité de changer de fournisseur facilement
