# 🚀 GUIDE D'ACTIONS IMMÉDIATES - Connexion MySQL & FTP LWS avec Vercel

## ✅ État actuel de votre projet

Votre application est déployée sur Vercel avec le domaine `acge-gabon.com`, mais elle n'utilise pas encore la base MySQL et le stockage LWS. Voici les étapes pour les connecter.

## 📋 Actions à effectuer MAINTENANT

### 1️⃣ Créer les tables dans MySQL LWS (5 minutes)

1. **Connectez-vous à phpMyAdmin LWS** :
   - Allez sur votre panneau LWS
   - Cliquez sur "MySql & PhpMyadmin"
   - Ouvrez phpMyAdmin pour la base `acgeg2647579`

2. **Exécutez le script SQL** :
   - Dans phpMyAdmin, sélectionnez votre base `acgeg2647579`
   - Cliquez sur l'onglet "SQL"
   - Copiez tout le contenu du fichier `scripts/setup-mysql-lws.sql`
   - Collez et cliquez sur "Exécuter"

3. **Vérifiez** :
   - Les 9 tables doivent être créées
   - L'utilisateur admin doit exister dans la table `users`

### 2️⃣ Créer le fichier .env.local (2 minutes)

Créez un fichier `.env.local` à la racine du projet avec ce contenu :

```env
# Base de données MySQL LWS
DATABASE_URL="mysql://acgeg2647579:Reviti2025%40@213.255.195.34:3306/acgeg2647579"

# Configuration NextAuth
NEXTAUTH_URL="https://acge-gabon.com"
NEXTAUTH_SECRET="générez-un-secret-avec-openssl-rand-base64-32"

# Configuration du stockage FTP
STORAGE_TYPE="ftp"
FTP_HOST="ftp.acge-gabon.com"
FTP_USER="acgeg2647579"
FTP_PASSWORD="Reviti2025@"
FTP_PORT="21"
FTP_SECURE="false"
UPLOAD_DIR="/uploads"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://acge-gabon.com"
```

⚠️ **IMPORTANT** : Remplacez `NEXTAUTH_SECRET` par une valeur générée avec :
```bash
openssl rand -base64 32
```

### 3️⃣ Tester les connexions localement (3 minutes)

```bash
# Installer les dépendances (si pas déjà fait)
npm install

# Générer le client Prisma
npm run db:generate

# Tester MySQL et FTP
npx tsx scripts/test-lws-connection.ts
```

✅ Les deux tests doivent passer (MySQL et FTP)

### 4️⃣ Configurer les variables sur Vercel (5 minutes)

**Option A : Via l'interface web Vercel**

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Ajoutez chaque variable de `.env.local`

**Option B : Via le script automatique**

```bash
# Si Vercel CLI n'est pas installé
npm install -g vercel

# Lancer le script de configuration
npx tsx scripts/setup-vercel-env.ts
```

Choisissez l'option 1 (automatique) pour utiliser `.env.local`

### 5️⃣ Créer la structure FTP sur LWS (2 minutes)

1. **Connectez-vous via FTP** (FileZilla ou autre) :
   - Serveur : `ftp.acge-gabon.com`
   - Utilisateur : `acgeg2647579`
   - Mot de passe : `Reviti2025@`
   - Port : `21`

2. **Créez ces dossiers** :
   ```
   /uploads/
   /uploads/documents/
   /uploads/avatars/
   /uploads/temp/
   ```

3. **Permissions** : 755 pour tous les dossiers

### 6️⃣ Déployer sur Vercel (5 minutes)

```bash
# Commiter les changements
git add .
git commit -m "Configuration MySQL LWS et stockage FTP"

# Pousser sur GitHub
git push origin master
```

Le déploiement sur Vercel se fera automatiquement.

### 7️⃣ Vérifier le déploiement

1. Attendez que le déploiement soit terminé (3-5 minutes)
2. Allez sur `https://acge-gabon.com`
3. Connectez-vous avec :
   - Email : `admin@acge.local`
   - Mot de passe : `admin123`

## 🧪 Tests de validation

### Test 1 : Connexion
- ✅ La page de login s'affiche
- ✅ Vous pouvez vous connecter avec l'admin
- ✅ Le dashboard s'affiche

### Test 2 : Base de données
- ✅ Les statistiques du dashboard se chargent
- ✅ Vous pouvez créer un dossier
- ✅ Les données apparaissent dans phpMyAdmin

### Test 3 : Stockage
- ✅ Vous pouvez uploader un fichier
- ✅ Le fichier apparaît dans `/uploads/documents/` via FTP
- ✅ Vous pouvez télécharger le fichier

## 🚨 En cas de problème

### Erreur de connexion MySQL
```bash
# Testez localement
npx tsx scripts/test-mysql-connection.ts
```
- Vérifiez les identifiants dans `.env.local`
- Vérifiez que votre IP est autorisée dans LWS

### Erreur de stockage FTP
```bash
# Testez la connexion FTP
npx tsx scripts/test-lws-connection.ts
```
- Vérifiez les identifiants FTP
- Vérifiez que le dossier `/uploads` existe

### Erreur sur Vercel
- Vérifiez les logs : Vercel Dashboard → Functions → Logs
- Vérifiez les variables d'environnement
- Redéployez si nécessaire

## 📞 Support rapide

- **LWS** : Ticket depuis votre espace client
- **Vercel** : [vercel.com/support](https://vercel.com/support)
- **Logs d'erreur** : Vercel Dashboard → Functions → Logs

## ⏱️ Temps total estimé : 25 minutes

Une fois ces étapes terminées, votre application sera pleinement fonctionnelle avec :
- ✅ Base de données MySQL LWS
- ✅ Stockage de fichiers FTP LWS
- ✅ Déploiement sur Vercel
- ✅ Domaine acge-gabon.com
