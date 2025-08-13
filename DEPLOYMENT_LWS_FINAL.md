# 🎉 Guide de Déploiement LWS - ACGE Gabon (FINAL)

## ✅ État Actuel
- ✅ Build statique généré dans `lws-upload/`
- ✅ Fichier `.htaccess` configuré
- ✅ Configuration Next.js optimisée pour LWS
- ✅ Routes API sauvegardées

## 🚀 Déploiement sur LWS

### 1. Upload des Fichiers

#### Étape 1 : Accéder au Panneau LWS
1. Connectez-vous à votre espace client LWS
2. Allez dans "Gestionnaire de fichiers"
3. Naviguez vers le dossier racine de votre domaine (`public_html` ou `www`)

#### Étape 2 : Nettoyer et Uploader
1. **Supprimez** tous les fichiers par défaut de LWS
2. **Uploadez** TOUT le contenu du dossier `lws-upload/` de votre projet
3. **Vérifiez** que le fichier `.htaccess` est à la racine

### 2. Configuration de la Base de Données MySQL

#### Étape 1 : Créer la Base MySQL
1. Dans votre panneau LWS, allez dans "MySql & PhpMyadmin"
2. Cliquez sur "Créer une nouvelle base de données"
3. Notez les informations :
   - **Nom de la base** : `acge_db`
   - **Utilisateur** : `acge_user`
   - **Mot de passe** : (créez un mot de passe sécurisé)
   - **Hostname** : (fourni par LWS)

#### Étape 2 : Mettre à Jour la Configuration
Modifiez le fichier `.env.production` avec vos vraies informations :

```env
DATABASE_URL="mysql://acge_user:votre_mot_de_passe@hostname_lws:3306/acge_db"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production_securise"
NEXT_PUBLIC_API_URL="https://acge-api.vercel.app"
NODE_ENV="production"
```

### 3. Configuration de l'API sur Vercel

#### Étape 1 : Créer le Projet API
1. Allez sur [vercel.com](https://vercel.com)
2. Créez un nouveau projet
3. Connectez votre repository GitHub
4. Configurez les variables d'environnement :
   - `DATABASE_URL` : Même URL que pour LWS
   - `NEXTAUTH_URL` : `https://acge-gabon.com`
   - `NEXTAUTH_SECRET` : Même secret que LWS

#### Étape 2 : Déployer l'API
```bash
# Dans votre projet local
git add .
git commit -m "Deploy API to Vercel"
git push origin main
```

### 4. Configuration de la Base de Données

#### Étape 1 : Générer le Client Prisma
```bash
npm run db:generate
```

#### Étape 2 : Créer les Tables
```bash
npm run db:push
```

#### Étape 3 : Créer un Administrateur
```bash
npm run create-admin
```

### 5. Test Final

#### Vérifications à Faire
1. ✅ `https://acge-gabon.com` affiche votre application
2. ✅ La page de connexion fonctionne
3. ✅ L'authentification fonctionne
4. ✅ Le dashboard s'affiche
5. ✅ L'upload de documents fonctionne
6. ✅ Les notifications fonctionnent

## 🔧 Commandes Utiles

```bash
# Reconstruire l'application
npm run build:lws

# Préparer les fichiers pour upload
npm run prepare:lws

# Tester les APIs
npm run test:apis

# Créer un admin
npm run create-admin
```

## 🚨 En Cas de Problème

### Problème : Page blanche
- Vérifiez que tous les fichiers sont uploadés
- Vérifiez la configuration `.htaccess`
- Vérifiez les logs d'erreur dans le panneau LWS

### Problème : Erreur de base de données
- Vérifiez les informations de connexion MySQL
- Vérifiez que la base de données existe
- Vérifiez les permissions utilisateur

### Problème : API non accessible
- Vérifiez l'URL de l'API dans `.env.production`
- Vérifiez que l'API est déployée sur Vercel
- Vérifiez les variables d'environnement Vercel

## 📁 Structure des Fichiers

```
lws-upload/
├── index.html (page d'accueil)
├── .htaccess (configuration serveur)
├── _next/ (assets Next.js)
├── dashboard/ (page dashboard)
├── login/ (page de connexion)
├── documents/ (page documents)
├── folders/ (page dossiers)
├── users/ (page utilisateurs)
├── profile/ (page profil)
├── upload/ (page upload)
├── notifications/ (page notifications)
└── README-UPLOAD.md (instructions)
```

## 🎯 Résultat Final

Votre application ACGE sera accessible sur `https://acge-gabon.com` avec :
- ✅ Interface utilisateur complète et fonctionnelle
- ✅ Base de données MySQL sur LWS
- ✅ API déployée sur Vercel
- ✅ Authentification sécurisée
- ✅ Gestion des documents et notifications
- ✅ Design moderne et responsive

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur dans le panneau LWS
2. Testez les APIs individuellement
3. Contactez le support LWS si nécessaire
4. Vérifiez la documentation Vercel pour l'API

---

**🎉 Félicitations ! Votre application ACGE est maintenant prête à être déployée sur LWS !**
