# Guide de Déploiement LWS - ACGE Gabon

## 🚨 Problème Actuel
Votre domaine `acge-gabon.com` affiche encore la page par défaut de LWS au lieu de votre application ACGE.

## ✅ Solution : Déploiement sur LWS

### 1. Préparation des Fichiers
✅ **Déjà fait** : Build de l'application généré dans le dossier `out/`
✅ **Déjà fait** : Fichier `.htaccess` configuré
✅ **Déjà fait** : Fichier `.env.production` créé

### 2. Configuration de la Base de Données MySQL sur LWS

#### Étape 1 : Accéder au Panneau LWS
1. Connectez-vous à votre espace client LWS
2. Allez dans la section "MySql & PhpMyadmin"
3. Cliquez sur "Créer une nouvelle base de données"

#### Étape 2 : Créer la Base de Données
1. **Nom de la base** : `acge_db` (ou votre choix)
2. **Utilisateur** : `acge_user` (ou votre choix)
3. **Mot de passe** : Créez un mot de passe sécurisé
4. **Hostname** : Notez l'hostname fourni par LWS

#### Étape 3 : Mettre à Jour la Configuration
Modifiez le fichier `.env.production` avec vos vraies informations :

```env
DATABASE_URL="mysql://acge_user:votre_mot_de_passe@hostname_lws:3306/acge_db"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production"
NEXT_PUBLIC_API_URL="https://acge-api.vercel.app"
NODE_ENV="production"
```

### 3. Upload des Fichiers sur LWS

#### Étape 1 : Accéder au Gestionnaire de Fichiers
1. Dans votre panneau LWS, allez dans "Gestionnaire de fichiers"
2. Naviguez vers le dossier racine de votre domaine (`public_html` ou `www`)

#### Étape 2 : Upload des Fichiers
1. **Supprimez** tous les fichiers par défaut de LWS
2. **Uploadez** tout le contenu du dossier `out/` de votre projet
3. **Uploadez** le fichier `.htaccess` à la racine

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

### 5. Déploiement de l'API sur Vercel

#### Étape 1 : Configurer l'API
1. Créez un nouveau projet Vercel pour l'API
2. Configurez les variables d'environnement :
   - `DATABASE_URL` : Même URL que pour LWS
   - `NEXTAUTH_URL` : `https://acge-gabon.com`
   - `NEXTAUTH_SECRET` : Même secret que LWS

#### Étape 2 : Déployer l'API
```bash
vercel --prod
```

### 6. Test Final

#### Vérifications à Faire
1. ✅ `https://acge-gabon.com` affiche votre application
2. ✅ La connexion à la base de données fonctionne
3. ✅ L'authentification fonctionne
4. ✅ L'upload de documents fonctionne
5. ✅ Les notifications fonctionnent

## 🔧 Commandes Utiles

```bash
# Reconstruire l'application
npm run build:lws

# Vérifier la configuration
npm run setup:lws

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

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur
2. Testez les APIs individuellement
3. Contactez le support LWS si nécessaire
4. Vérifiez la documentation Vercel pour l'API

## 🎯 Objectif Final

Votre application ACGE sera accessible sur `https://acge-gabon.com` avec :
- Interface utilisateur complète
- Base de données MySQL fonctionnelle
- API déployée sur Vercel
- Authentification sécurisée
- Gestion des documents et notifications
