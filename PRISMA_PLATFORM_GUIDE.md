# 🌐 Guide de Configuration Prisma Data Platform

## 📋 Vue d'ensemble

Ce guide vous accompagne pour migrer votre base de données locale vers **Prisma Data Platform** et la connecter à Vercel.

## 🚀 Étapes de Configuration

### 1. Créer la Base de Données sur Prisma Data Platform

1. **Accéder à la console Prisma** :
   - Aller sur : https://console.prisma.io/cme8tjr0i00jz1dm3veuwd1xj/cme8tnulp0376yblzsrmsp6q6/environments
   - Se connecter avec votre compte Prisma

2. **Créer une nouvelle base de données** :
   - Cliquer sur **"Create database"**
   - Choisir **"PostgreSQL"**
   - Sélectionner votre **région préférée** (recommandé : Europe)
   - Cliquer sur **"Create database"**

3. **Récupérer l'URL de connexion** :
   - Une fois créée, copier l'URL de connexion PostgreSQL
   - Format : `postgresql://username:password@hostname:port/database`

### 2. Configurer l'Environnement Local

1. **Mettre à jour .env.local** :
   ```env
   # Remplacer l'ancienne DATABASE_URL par la nouvelle
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   
   # Garder les autres variables
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

2. **Vérifier la connexion** :
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

### 3. Migrer les Données

1. **Exécuter la migration** :
   ```bash
   npm run migrate:to-platform
   ```

2. **Vérifier la migration** :
   ```bash
   npm run prisma:manage
   ```

### 4. Configurer Vercel

1. **Variables d'environnement sur Vercel** :
   ```env
   DATABASE_URL="postgresql://username:password@hostname:port/database"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXT_PUBLIC_API_URL="https://your-app.vercel.app"
   ```

2. **Déployer sur Vercel** :
   ```bash
   vercel --prod
   ```

## 🔧 Scripts Disponibles

```bash
# Configuration Prisma Data Platform
npm run setup:platform          # Préparer la migration
npm run migrate:to-platform     # Migrer les données

# Gestion de la base de données
npm run prisma:manage           # Gestionnaire complet
npm run prisma:migrate          # Gestionnaire de migrations
npm run backup:current          # Sauvegarder les données
npm run restore:backup          # Restaurer les données

# Commandes Prisma CLI
npx prisma studio               # Interface graphique
npx prisma migrate dev          # Créer une migration
npx prisma migrate deploy       # Déployer les migrations
npx prisma db push              # Pousser le schéma
npx prisma generate             # Générer le client
```

## 📊 Données à Migrer

Votre base locale contient actuellement :
- ✅ **1 utilisateur admin** : admin@acge.ga
- ✅ **1 document** avec version
- ✅ **1 dossier** créé
- ✅ **Structure complète** avec toutes les tables

## 🛠️ Dépannage

### Problème de Connexion
```bash
# Vérifier la connexion
npx prisma db pull

# Régénérer le client
npx prisma generate
```

### Problème de Migration
```bash
# Vérifier les données sauvegardées
cat prisma-platform-backup.json

# Relancer la migration
npm run migrate:to-platform
```

### Problème sur Vercel
1. Vérifier les variables d'environnement
2. S'assurer que la base est accessible depuis Vercel
3. Consulter les logs de déploiement

## 🎯 Avantages de Prisma Data Platform

1. **Performance** : Base de données optimisée
2. **Fiabilité** : Sauvegarde automatique
3. **Scalabilité** : Évolue avec votre application
4. **Intégration** : Parfaitement intégré avec Vercel
5. **Monitoring** : Tableaux de bord intégrés

## 📝 Notes Importantes

- ✅ **Sauvegarde automatique** : Vos données sont sauvegardées dans `prisma-platform-backup.json`
- ✅ **Migration sécurisée** : Les données sont migrées dans le bon ordre
- ✅ **Vérification** : Chaque étape est vérifiée automatiquement
- ✅ **Rollback possible** : Vous pouvez revenir à la base locale si nécessaire

## 🔑 Informations de Connexion

- **URL de l'application** : https://your-app.vercel.app
- **Email admin** : admin@acge.ga
- **Mot de passe admin** : admin123

## 🎉 Prochaines Étapes

1. Créer la base sur Prisma Data Platform
2. Mettre à jour DATABASE_URL
3. Exécuter la migration
4. Déployer sur Vercel
5. Tester l'application

**Votre application sera alors entièrement opérationnelle sur Vercel avec Prisma Data Platform !** 🚀
