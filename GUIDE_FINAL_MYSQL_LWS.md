# 🚀 Guide Complet : Connexion MySQL LWS + Stockage avec Vercel

## 📋 Vue d'ensemble

Ce guide vous aidera à :
1. ✅ Connecter votre application déployée sur Vercel avec la base MySQL LWS
2. ✅ Configurer le stockage de fichiers sur LWS
3. ✅ Synchroniser les données entre Vercel et LWS

## 🔧 Partie 1 : Configuration de la Base de Données MySQL LWS

### Étape 1 : Créer les tables dans phpMyAdmin

1. **Accédez à phpMyAdmin** :
   - Connectez-vous à votre panneau LWS
   - Allez dans "MySql & PhpMyadmin"
   - Cliquez sur "PhpMyAdmin" pour votre base `acgeg2647579`

2. **Exécutez le script SQL** :
   - Sélectionnez votre base `acgeg2647579`
   - Cliquez sur l'onglet "SQL"
   - Copiez et collez le contenu du fichier `scripts/setup-mysql-lws.sql`
   - Cliquez sur "Exécuter"

### Étape 2 : Vérifier la création des tables

Après exécution, vérifiez que ces tables sont créées :
- `users`
- `folders`
- `documents`
- `document_versions`
- `tags`
- `_DocumentToTag`
- `document_shares`
- `comments`
- `notifications`

### Étape 3 : Vérifier l'administrateur

Dans la table `users`, vérifiez la présence de :
- **ID** : `admin-acge-001`
- **Email** : `admin@acge.local`
- **Mot de passe** : hashé (correspond à `admin123`)
- **Rôle** : `ADMIN`

## 🌐 Partie 2 : Configuration sur Vercel

### Étape 1 : Configurer les variables d'environnement

1. **Accédez à votre projet Vercel** :
   - Allez sur [vercel.com](https://vercel.com)
   - Sélectionnez votre projet

2. **Ajoutez les variables d'environnement** :
   - Allez dans Settings → Environment Variables
   - Ajoutez ces variables :

```env
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="votre_secret_production_securise_changez_ceci"
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"

# Variables pour le stockage LWS (à ajouter)
STORAGE_TYPE="ftp"
FTP_HOST="ftp.acge-gabon.com"
FTP_USER="acgeg2647579"
FTP_PASSWORD="Reviti2025@"
FTP_PORT="21"
FTP_SECURE="false"
UPLOAD_DIR="/uploads"
```

3. **Redéployez l'application** :
   - Après avoir ajouté les variables, cliquez sur "Redeploy"

## 📁 Partie 3 : Configuration du Stockage FTP LWS

### Étape 1 : Créer le dossier uploads sur LWS

1. **Connectez-vous via FTP** :
   - Utilisez un client FTP (FileZilla, WinSCP, etc.)
   - Serveur : `ftp.acge-gabon.com`
   - Utilisateur : `acgeg2647579`
   - Mot de passe : `Reviti2025@`
   - Port : `21`

2. **Créez la structure de dossiers** :
```
/
├── uploads/
│   ├── documents/
│   ├── avatars/
│   └── temp/
```

3. **Définissez les permissions** :
   - Dossier `uploads` : 755
   - Sous-dossiers : 755

### Étape 2 : Configurer l'API de stockage

Le code pour gérer le stockage FTP est déjà intégré. Il utilise les variables d'environnement configurées.

## 🔄 Partie 4 : Migration des données existantes

Si vous avez des données existantes à migrer :

### Option 1 : Export/Import via phpMyAdmin

1. **Export depuis l'ancienne base** :
   - Dans phpMyAdmin, sélectionnez votre ancienne base
   - Cliquez sur "Exporter"
   - Choisissez "SQL" comme format
   - Téléchargez le fichier

2. **Import dans la nouvelle base** :
   - Sélectionnez votre base LWS
   - Cliquez sur "Importer"
   - Sélectionnez votre fichier SQL
   - Cliquez sur "Exécuter"

### Option 2 : Script de migration

Utilisez le script de migration fourni :
```bash
npm run migrate:lws
```

## ✅ Partie 5 : Tests et Vérification

### Test 1 : Connexion à l'application

1. Allez sur `https://acge-gabon.com`
2. Connectez-vous avec :
   - Email : `admin@acge.local`
   - Mot de passe : `admin123`

### Test 2 : Upload de fichiers

1. Connectez-vous à l'application
2. Allez dans "Upload"
3. Téléchargez un fichier test
4. Vérifiez que le fichier apparaît dans `/uploads/documents/` via FTP

### Test 3 : Création de données

1. Créez un nouveau dossier
2. Uploadez un document
3. Vérifiez dans phpMyAdmin que les données sont créées

## 🚨 Dépannage

### Problème : Erreur de connexion à la base de données

**Solution** :
1. Vérifiez que l'IP de Vercel est autorisée dans LWS
2. Testez la connexion avec le script :
```bash
npx tsx scripts/test-mysql-connection.ts
```

### Problème : Upload de fichiers échoue

**Solution** :
1. Vérifiez les identifiants FTP
2. Vérifiez que le dossier `/uploads` existe
3. Vérifiez les permissions (755)

### Problème : Erreur d'authentification

**Solution** :
1. Régénérez le NEXTAUTH_SECRET :
```bash
openssl rand -base64 32
```
2. Mettez à jour la variable sur Vercel
3. Redéployez l'application

### Problème : Tables non créées

**Solution** :
1. Exécutez le script SQL ligne par ligne dans phpMyAdmin
2. Vérifiez les erreurs spécifiques
3. Assurez-vous que l'utilisateur MySQL a les permissions CREATE

## 📊 Monitoring et Maintenance

### Surveillance de la base de données

1. **Via phpMyAdmin** :
   - Vérifiez régulièrement la taille des tables
   - Surveillez les requêtes lentes
   - Optimisez les index si nécessaire

2. **Via les logs LWS** :
   - Consultez les logs d'erreur MySQL
   - Surveillez l'utilisation des ressources

### Sauvegardes

1. **Automatiques (LWS)** :
   - LWS effectue des sauvegardes quotidiennes
   - Conservées pendant 7 jours

2. **Manuelles** :
   - Export régulier via phpMyAdmin
   - Script de backup :
```bash
npm run backup:lws
```

## 🔐 Sécurité

### Recommandations importantes

1. **Changez les mots de passe par défaut** :
   - Mot de passe admin
   - NEXTAUTH_SECRET

2. **Limitez les accès** :
   - Configurez les IP autorisées dans LWS
   - Utilisez des mots de passe forts

3. **Chiffrement** :
   - Activez SSL/TLS pour les connexions
   - Utilisez HTTPS pour toutes les communications

## 📞 Support

### Ressources utiles

- **Support LWS** : [support.lws.fr](https://support.lws.fr)
- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Documentation Prisma** : [prisma.io/docs](https://prisma.io/docs)

### Contacts

- Support technique LWS : Via votre espace client
- Support Vercel : Via le dashboard Vercel
- Communauté : Forums et Discord

## 🎉 Conclusion

Votre application est maintenant :
- ✅ Hébergée sur Vercel avec le domaine acge-gabon.com
- ✅ Connectée à la base MySQL LWS
- ✅ Configurée pour stocker les fichiers sur LWS via FTP
- ✅ Prête pour la production

**Prochaines étapes recommandées** :
1. Changez les mots de passe par défaut
2. Configurez les sauvegardes automatiques
3. Mettez en place le monitoring
4. Créez les utilisateurs réels