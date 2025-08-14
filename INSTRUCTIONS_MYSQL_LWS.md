# 🚀 Instructions pour Configurer la Base de Données MySQL LWS

## ✅ État Actuel
- ✅ Configuration Prisma pour MySQL
- ✅ Scripts de connexion créés
- ✅ Code poussé sur GitHub
- ✅ Déploiement automatique déclenché

## 📋 Étapes à Suivre

### 1. Accéder à phpMyAdmin LWS
1. Connectez-vous à votre panneau LWS
2. Allez dans "MySql & PhpMyadmin"
3. Cliquez sur "PhpMyAdmin" pour votre base `acgeg2647579`

### 2. Exécuter le Script SQL
1. Dans phpMyAdmin, sélectionnez votre base `acgeg2647579`
2. Cliquez sur l'onglet "SQL"
3. Copiez et collez le contenu du fichier `scripts/setup-mysql-lws.sql`
4. Cliquez sur "Exécuter"

### 3. Vérifier les Tables Créées
Après l'exécution, vous devriez voir ces tables :
- `users`
- `folders`
- `documents`
- `document_versions`
- `tags`
- `_DocumentToTag`
- `document_shares`
- `comments`
- `notifications`

### 4. Vérifier l'Administrateur
Dans la table `users`, vous devriez avoir :
- **Email** : `admin@acge.local`
- **Mot de passe** : `admin123`
- **Rôle** : `ADMIN`

## 🔧 Configuration de l'Application

### Variables d'Environnement
Votre fichier `.env.local` contient :
```env
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production_securise_changez_ceci"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"
```

### Déploiement
L'application sera automatiquement déployée sur Vercel grâce au push GitHub.

## 🎯 Test de Connexion

### 1. Tester l'Application
1. Allez sur `https://acge-gabon.com`
2. Cliquez sur "Se connecter"
3. Utilisez les identifiants :
   - **Email** : `admin@acge.local`
   - **Mot de passe** : `admin123`

### 2. Vérifier les Fonctionnalités
- ✅ Dashboard
- ✅ Gestion des documents
- ✅ Gestion des dossiers
- ✅ Notifications
- ✅ Profil utilisateur

## 🚨 En Cas de Problème

### Erreur de Connexion
1. Vérifiez que toutes les tables sont créées dans phpMyAdmin
2. Vérifiez que l'administrateur existe dans la table `users`
3. Vérifiez les variables d'environnement sur Vercel

### Erreur d'Authentification
1. Vérifiez que le hash du mot de passe est correct
2. Essayez de recréer l'administrateur avec le script SQL

### Erreur de Base de Données
1. Vérifiez les permissions de l'utilisateur MySQL
2. Contactez le support LWS si nécessaire

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur dans le panneau LWS
2. Vérifiez les logs de déploiement sur Vercel
3. Contactez le support technique

## 🎉 Résultat Final

Après ces étapes, votre application ACGE sera :
- ✅ Connectée à la base MySQL LWS
- ✅ Déployée sur Vercel
- ✅ Accessible sur `https://acge-gabon.com`
- ✅ Fonctionnelle avec authentification
- ✅ Prête à être utilisée
