# 🗄️ Configuration de la Base de Données

## 📋 Étapes pour configurer PostgreSQL

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec ce contenu :

```env
# Configuration de la base de données PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/acge_db"

# Configuration NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-12345"

# Environment
NODE_ENV="development"
```

### 2. Modifier les paramètres selon votre installation

#### Si vous utilisez PostgreSQL local :
- **postgres** : nom d'utilisateur (par défaut)
- **password** : votre mot de passe PostgreSQL
- **localhost:5432** : hôte et port (par défaut)
- **acge_db** : nom de la base de données (sera créée)

#### Si vous utilisez PostgreSQL hébergé :
Remplacez DATABASE_URL par l'URL fournie par votre hébergeur.

### 3. Créer la base de données

Connectez-vous à PostgreSQL et créez la base :
```sql
CREATE DATABASE acge_db;
```

Ou utilisez pgAdmin pour créer la base graphiquement.

### 4. Initialiser les tables

Une fois le fichier `.env.local` configuré :

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Créer l'administrateur
npm run create-admin
```

## 🔐 Identifiants de l'administrateur

Après avoir exécuté `npm run create-admin` :
- **Email** : `admin@acge.local`
- **Mot de passe** : `admin123`

## ⚠️ Important

1. **Ne commitez jamais** le fichier `.env.local`
2. **Changez le NEXTAUTH_SECRET** en production
3. **Changez le mot de passe admin** après la première connexion

## 🆘 Dépannage

### Erreur de connexion PostgreSQL
- Vérifiez que PostgreSQL est démarré
- Vérifiez le port (5432 par défaut)
- Vérifiez les credentials

### Windows avec PostgreSQL
```bash
# Démarrer PostgreSQL (si installé comme service)
net start postgresql-x64-14

# Ou via pgAdmin
```

### Linux/Mac
```bash
# Démarrer PostgreSQL
sudo systemctl start postgresql
# ou
brew services start postgresql
```
