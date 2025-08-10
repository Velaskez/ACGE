# 🚀 Guide de Démarrage Rapide - GED Application

## ⚡ Configuration Express

### 1. Prérequis
- Node.js 18+
- PostgreSQL installé et configuré

### 2. Installation
```bash
# Cloner le projet
git clone <repository-url>
cd ged-app

# Installer les dépendances
npm install
```

### 3. Configuration de l'Environnement
Créez un fichier `.env.local` :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/acge_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NODE_ENV="development"
```

### 4. Configuration de la Base de Données
```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Créer le premier administrateur
npm run create-admin
```

### 5. Démarrer l'Application
```bash
npm run dev
```

---

## 🔐 Workflow de Sécurité

### ✅ **Nouveau Workflow Sécurisé**

1. **Accès Restreint** : Seuls les utilisateurs authentifiés peuvent accéder à l'application
2. **Pas d'Inscription Publique** : L'inscription est désactivée
3. **Gestion Administrative** : Seuls les administrateurs peuvent créer des utilisateurs
4. **Protection des Routes** : Toutes les pages sont protégées

### 🔑 **Première Connexion**

Après avoir exécuté `npm run create-admin`, utilisez :
- **Email** : `admin@acge.local`
- **Mot de passe** : `admin123`

⚠️ **IMPORTANT** : Changez le mot de passe après la première connexion !

---

## 👥 Gestion des Utilisateurs

### **Rôles Disponibles**
- **ADMIN** : Accès complet, gestion des utilisateurs
- **MANAGER** : Gestion des documents et dossiers
- **USER** : Utilisation basique de l'application

### **Créer de Nouveaux Utilisateurs**
1. Connectez-vous en tant qu'administrateur
2. Allez dans "Utilisateurs" (menu de gauche)
3. Cliquez sur "Nouvel utilisateur"
4. Remplissez les informations et choisissez le rôle

---

## 📱 Test de l'Application

### **Pages Accessibles**
- `/` → Redirection automatique vers login ou dashboard
- `/login` → Page de connexion
- `/dashboard` → Tableau de bord (après authentification)
- `/users` → Gestion des utilisateurs (admin seulement)

### **Fonctionnalités Testées**
- ✅ Connexion sécurisée
- ✅ Protection des routes
- ✅ Gestion des utilisateurs (admin)
- ✅ Interface responsive
- ✅ Navigation conditionnelle selon les rôles

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer en mode développement
npm run build            # Construire pour la production
npm run start            # Démarrer en mode production

# Base de données
npm run db:generate      # Générer le client Prisma
npm run db:push          # Pousser le schéma vers la DB
npm run db:studio        # Ouvrir Prisma Studio
npm run create-admin     # Créer le premier administrateur

# Linting
npm run lint             # Vérifier le code
```

---

## 🚨 Dépannage

### **Erreur de Connexion à la Base de Données**
```bash
# Vérifier que PostgreSQL est démarré
# Vérifier la DATABASE_URL dans .env.local
# Tester la connexion
npx prisma db push
```

### **Erreur d'Authentification**
```bash
# Vérifier NEXTAUTH_SECRET dans .env.local
# Vérifier NEXTAUTH_URL
# Recréer l'administrateur si nécessaire
npm run create-admin
```

### **Erreurs de Build**
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🎯 Prochaines Étapes

Une fois l'application configurée :

1. **Phase 2** : Upload et gestion des documents
2. **Phase 3** : Système de recherche et filtres
3. **Phase 4** : Fonctionnalités avancées

---

## 📞 Support

- Consultez `SETUP.md` pour la configuration détaillée
- Consultez `CHECKLIST.md` pour vérifier l'installation
- Vérifiez les logs dans la console pour les erreurs

---

**🎉 Votre application GED est maintenant sécurisée et prête à être utilisée !**
