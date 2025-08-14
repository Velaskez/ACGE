# Guide Configuration Domaine LWS → Vercel

## 🎯 Problème
Le domaine `acge-gabon.com` n'est pas accessible car il n'est pas configuré pour pointer vers Vercel.

## 🔧 Solution : Configuration DNS sur LWS

### 1️⃣ Accéder au panneau de contrôle LWS
1. Connectez-vous à votre espace client LWS
2. Allez dans la section "Gestion des domaines"
3. Sélectionnez `acge-gabon.com`

### 2️⃣ Configurer les enregistrements DNS
Vous devez ajouter/modifier ces enregistrements DNS :

#### Option A : Redirection simple (Recommandée)
```
Type: CNAME
Nom: @ (ou laissez vide)
Valeur: cname.vercel-dns.com
TTL: 3600 (ou automatique)
```

#### Option B : Configuration complète
```
Type: A
Nom: @ (ou laissez vide)
Valeur: 76.76.19.19
TTL: 3600

Type: A
Nom: www
Valeur: 76.76.19.19
TTL: 3600
```

### 3️⃣ Vérifier la configuration
Après avoir configuré les DNS, attendez 5-10 minutes puis testez :
```
https://acge-gabon.com
```

## 🚀 Solution temporaire : Utiliser l'URL Vercel

En attendant la configuration du domaine, utilisez l'URL Vercel directe :

### URL de test actuelle :
```
https://acge-8m0i3y47d-velaskezs-projects.vercel.app/test-admin
```

### Identifiants Admin :
- **Email** : `admin@acge-gabon.com`
- **Mot de passe** : `Admin2025!`

## 📋 Étapes pour résoudre l'authentification

### 1️⃣ Utiliser la page de test
Allez sur : `https://acge-8m0i3y47d-velaskezs-projects.vercel.app/test-admin`

### 2️⃣ Créer l'admin
Cliquez sur "Créer Admin" pour créer l'utilisateur administrateur

### 3️⃣ Se connecter
Utilisez les identifiants ci-dessus pour vous connecter

### 4️⃣ Tester l'application
Une fois connecté, testez toutes les fonctionnalités

## 🔍 Vérification

Pour vérifier que tout fonctionne :
1. L'admin est créé avec succès
2. Vous pouvez vous connecter
3. L'upload de fichiers fonctionne
4. La base de données MySQL est accessible

## ⚠️ Important

- Les changements DNS peuvent prendre jusqu'à 24h pour se propager
- En attendant, utilisez l'URL Vercel directe
- Une fois le domaine configuré, vous pourrez utiliser `https://acge-gabon.com`

## 📞 Support

Si vous avez des difficultés avec la configuration DNS sur LWS, contactez leur support technique.
