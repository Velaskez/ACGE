# 🔧 Guide de Configuration Vercel-Prisma Data Platform

## 📋 Étapes de Configuration

### 1. **Mise à jour de la variable DATABASE_URL sur Vercel**

Exécutez ces commandes dans l'ordre :

```bash
# Supprimer l'ancienne variable
vercel env rm DATABASE_URL --yes

# Ajouter la nouvelle variable
vercel env add DATABASE_URL
```

**Quand on vous demande la valeur, entrez :**
```
postgres://85ac3cefb1cfdf40c8a6405188632847e9f9d3b8196f64b3ef27df1923a492a7:sk_C2QbeAAVSxoSULC_YhGiI@db.prisma.io:5432/?sslmode=require
```

**Sélectionnez tous les environnements :** Production, Preview, Development

### 2. **Synchronisation du schéma**

```bash
# Pousser le schéma vers la nouvelle base
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### 3. **Migration des données**

```bash
# Migrer les données existantes
npm run migrate:new-db
```

### 4. **Redéploiement**

```bash
# Redéployer sur Vercel
vercel --prod
```

## 🚀 Configuration Automatique

Vous pouvez aussi utiliser le script automatique :

```bash
npm run setup:vercel-prisma
```

## 🔍 Vérification

Une fois configuré, testez :

1. **Connexion à l'application :** https://acge-app.vercel.app/login
2. **Identifiants :** admin@acge.ga / admin123
3. **Vérification des logs :** `vercel logs https://acge-app.vercel.app`

## 📊 Variables d'environnement configurées

- ✅ `DATABASE_URL` : Nouvelle base Prisma Data Platform
- ✅ `NEXTAUTH_SECRET` : Clé d'authentification
- ✅ `NEXTAUTH_URL` : URL de production
- ✅ `NEXT_PUBLIC_API_URL` : URL de l'API

## 🆘 En cas de problème

1. **Vérifiez les logs :** `vercel logs https://acge-app.vercel.app`
2. **Testez la connexion locale :** `npm run dev`
3. **Vérifiez les variables :** `vercel env ls`

## 🎯 Résultat attendu

- ✅ Application accessible sur Vercel
- ✅ Connexion à la base de données fonctionnelle
- ✅ Authentification opérationnelle
- ✅ Données migrées et accessibles
