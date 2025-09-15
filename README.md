# 🏢 ACGE - Agence Comptable des Grandes Écoles

Une application web moderne et responsive pour la gestion de l'agence comptable des grandes écoles, construite avec Next.js 14, TypeScript, et Tailwind CSS.

## ✨ Fonctionnalités

### 🔐 Authentification
- Inscription et connexion sécurisées
- Gestion des rôles utilisateurs (Admin, Manager, User)
- Sessions persistantes avec NextAuth.js

### 📁 Gestion des Fichiers
- Upload multi-fichiers avec drag & drop
- Support de tous les formats courants (PDF, DOC, XLS, images, etc.)
- Métadonnées automatiques (date, taille, type)
- Versioning des fichiers
- Recherche full-text

### 🗂️ Organisation
- Dossiers hiérarchiques
- Tags et catégories personnalisables
- Système de partage et permissions
- Commentaires et annotations

### 🎨 Interface Utilisateur
- Design responsive (mobile, tablette, desktop)
- Interface moderne avec shadcn/ui
- Thème sombre/clair
- Navigation intuitive

## 🚀 Technologies Utilisées

- **Frontend :** Next.js 14, TypeScript, Tailwind CSS
- **UI Components :** shadcn/ui, Radix UI
- **Base de données :** PostgreSQL avec Prisma ORM
- **Authentification :** NextAuth.js
- **Styling :** Tailwind CSS
- **Icons :** Lucide React

## 📋 Prérequis

- Node.js 18+ 
- PostgreSQL
- npm ou yarn

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd ged-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration automatique de l'environnement**
   ```bash
   # Configuration automatique avec la clé de service role
   npm run setup:env
   
   # Ou forcer le remplacement si le fichier existe déjà
   npm run setup:env:force
   ```

4. **Récupérer votre clé anon Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet
   - Allez dans Settings > API
   - Copiez la clé "anon public" et remplacez `your-anon-key-here` dans `.env.local`

   > 📝 **Note** : Consultez [SETUP_QUICK.md](./SETUP_QUICK.md) pour un guide de configuration détaillé.

5. **Configuration de la base de données**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Démarrer l'application**
   ```bash
   npm run dev
   ```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
src/
├── app/                    # App Router Next.js
│   ├── (auth)/            # Routes d'authentification
│   │   ├── login/
│   │   └── register/
│   ├── api/               # API routes
│   │   └── auth/
│   ├── dashboard/         # Dashboard principal
│   └── globals.css
├── components/
│   ├── ui/               # Composants shadcn/ui
│   ├── layout/           # Header, Sidebar, Layout
│   ├── documents/        # Composants spécifiques
│   └── providers/        # Providers (Session, etc.)
├── lib/                  # Utilitaires et configs
│   ├── auth.ts          # Configuration NextAuth
│   ├── db.ts            # Configuration Prisma
│   └── utils.ts         # Utilitaires
├── types/                # Types TypeScript
└── prisma/
    └── schema.prisma     # Schéma base de données
```

## 🔧 Configuration

### Base de Données
L'application utilise PostgreSQL avec Prisma ORM. Le schéma inclut :
- **Users** : Gestion des utilisateurs et rôles
- **Documents** : Stockage des métadonnées des fichiers
- **Folders** : Organisation hiérarchique
- **Tags** : Catégorisation des documents
- **DocumentShare** : Partage et permissions
- **Comments** : Commentaires sur les fichiers

### Authentification
- NextAuth.js avec provider credentials
- Hashage des mots de passe avec bcryptjs
- Sessions JWT sécurisées

## 🎯 Fonctionnalités à Venir

### Phase 2
- [ ] Upload de fichiers avec drag & drop
- [ ] Prévisualisation des documents
- [ ] Système de recherche avancée
- [ ] Notifications en temps réel

### Phase 3
- [ ] Collaboration en temps réel
- [ ] Workflow d'approbation
- [ ] Audit trail complet
- [ ] API REST complète

### Phase 4
- [ ] Application mobile
- [ ] Intégration cloud storage
- [ ] OCR pour les images
- [ ] Analytics avancées

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**Développé avec ❤️ pour une gestion moderne et efficace de l'agence comptable**
