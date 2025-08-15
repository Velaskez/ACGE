# ACGE - Guide de Développement

## 🚀 Démarrage Rapide

### Option 1: Script automatique (Recommandé)

**Windows:**
```bash
scripts/start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### Option 2: Manuel

1. **Configurer les variables d'environnement:**
```bash
export DATABASE_URL="file:./prisma/dev.db"
export NEXTAUTH_SECRET="your-secret-key-here"
export NEXTAUTH_URL="http://localhost:3000"
export NODE_ENV="development"
```

2. **Créer la base de données:**
```bash
npx prisma db push
```

3. **Initialiser les données de test:**
```bash
npx tsx scripts/reset-database.ts
```

4. **Démarrer le serveur:**
```bash
npm run dev
```

## 🔑 Identifiants de Test

- **Admin:** `admin@acge.com` / `admin123`
- **Manager:** `manager@acge.com` / `manager123`
- **User:** `user@acge.com` / `user123`

## 🧪 Tests API

Accédez à la page de test complète : http://localhost:3000/test-all-apis.html

Cette page teste tous les endpoints API et affiche les résultats en temps réel.

## 🔧 Dépannage

### Erreur "Engine is not yet connected"

1. Réinitialiser la connexion Prisma :
```bash
curl -X POST http://localhost:3000/api/reset-db-connection
```

2. Ou redémarrer le serveur avec les bonnes variables d'environnement.

### Erreur de base de données

1. Supprimer et recréer la base :
```bash
rm prisma/dev.db
npx prisma db push
npx tsx scripts/reset-database.ts
```

### Erreur de permissions Prisma

1. Nettoyer le cache :
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

## 📊 Structure de la Base de Données

- **Users:** Utilisateurs avec rôles (ADMIN, MANAGER, USER)
- **Folders:** Dossiers organisés hiérarchiquement
- **Documents:** Documents avec versions multiples
- **Notifications:** Notifications système
- **Tags:** Tags pour catégoriser les documents

## 🌐 Endpoints API Principaux

- `GET /api/health` - Santé de l'API
- `GET /api/debug-db` - Debug de la base de données
- `GET /api/test-users` - Test des utilisateurs
- `GET /api/test-profile` - Test du profil
- `GET /api/notifications` - Notifications
- `GET /api/documents` - Documents
- `GET /api/folders` - Dossiers

## 📝 Scripts Utiles

- `scripts/reset-database.ts` - Réinitialiser complètement la base
- `scripts/init-test-data.ts` - Initialiser les données de test
- `scripts/start-dev.sh` - Script de démarrage Linux/Mac
- `scripts/start-dev.bat` - Script de démarrage Windows
