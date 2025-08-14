# 🔌 Guide de Connexion à la Base de Données MySQL LWS

## ✅ Configuration Actuelle

Votre base de données MySQL LWS est configurée avec :
- **Utilisateur** : `acgeg2647579`
- **Base de données** : `acgeg2647579`
- **Serveur** : `213.255.195.34`
- **Port** : `3306`
- **Mot de passe** : `Reviti2025@`

## 🚀 Étapes de Connexion

### 1. Vérifier la Configuration

Le fichier `.env.local` contient :
```env
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"
```

### 2. Synchroniser le Schéma

```bash
# Générer le client Prisma pour MySQL
npm run db:generate

# Synchroniser le schéma avec la base LWS
npx tsx scripts/sync-mysql-schema.ts
```

### 3. Créer l'Administrateur

```bash
# Créer un administrateur dans la base LWS
npx tsx scripts/create-admin-mysql.ts
```

### 4. Tester la Connexion

```bash
# Tester la connexion à la base LWS
npx tsx scripts/test-mysql-connection.ts
```

## 🔧 Commandes Utiles

### Pour le Développement Local
```bash
# Utiliser SQLite local
copy env-local.txt .env.local
npm run db:generate
npm run db:push
```

### Pour la Production LWS
```bash
# Utiliser MySQL LWS
copy env-production.txt .env.local
npm run db:generate
npx tsx scripts/sync-mysql-schema.ts
npx tsx scripts/create-admin-mysql.ts
```

## 📊 Identifiants de Connexion

Après avoir créé l'administrateur :
- **Email** : `admin@acge.local`
- **Mot de passe** : `admin123`
- **Rôle** : `ADMIN`

## 🚨 Dépannage

### Erreur de Connexion
- Vérifiez que le serveur MySQL LWS est accessible
- Vérifiez les informations de connexion
- Vérifiez que l'utilisateur a les bonnes permissions

### Erreur de Schéma
- Exécutez `npx tsx scripts/sync-mysql-schema.ts`
- Vérifiez que toutes les tables sont créées

### Erreur d'Authentification
- Vérifiez que l'administrateur est créé
- Utilisez les identifiants corrects

## 🔐 Sécurité

- Changez le mot de passe admin après la première connexion
- Utilisez des mots de passe forts
- Ne partagez jamais les informations de connexion

## 📞 Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Testez la connexion avec le script de test
3. Contactez le support LWS si nécessaire
