# ACGE - Agence Comptable des Grandes Écoles

## 🏢 Description
Application moderne de gestion comptable pour les grandes écoles du Gabon, développée avec Next.js 15 et Supabase.

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Rôles
- **Secrétaire** : Création et soumission des dossiers
- **Contrôleur Budgétaire (CB)** : Validation des contrôles de fond
- **Ordonnateur** : Vérifications spécifiques et ordonnancement
- **Agent Comptable (AC)** : Validation définitive et génération de quitus

### 📋 Workflow Complet
1. **Création** : Secrétaire crée un dossier avec documents
2. **Validation CB** : Contrôles de fond et types d'opérations
3. **Ordonnancement** : Vérifications ordonnateur et ordonnancement
4. **Validation AC** : Validation définitive et génération de quitus

### 🔧 Fonctionnalités Techniques
- 🔐 Authentification sécurisée avec NextAuth
- 📊 Dashboard personnalisé par rôle
- 📄 Upload et gestion des documents
- 🖨️ Génération de quitus format A4 professionnel
- 🔔 Système de notifications intelligent
- 📈 Analytics et Speed Insights Vercel

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15, React 18, TypeScript
- **Backend** : Next.js API Routes, Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Authentification** : NextAuth.js
- **UI/UX** : Tailwind CSS, Shadcn/UI
- **Déploiement** : Vercel
- **Analytics** : Vercel Speed Insights & Analytics

## 📁 Structure du Projet

```
ACGE/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Pages d'authentification
│   │   ├── (protected)/      # Pages protégées par rôle
│   │   └── api/              # API Routes
│   ├── components/
│   │   ├── auth/             # Composants d'authentification
│   │   ├── cb/               # Composants Contrôleur Budgétaire
│   │   ├── ordonnateur/      # Composants Ordonnateur
│   │   ├── ac/               # Composants Agent Comptable
│   │   ├── documents/        # Gestion des documents
│   │   ├── upload/           # Upload de fichiers
│   │   ├── ui/               # Composants UI réutilisables
│   │   └── shared/           # Composants partagés
│   ├── lib/                  # Utilitaires et configuration
│   ├── hooks/                # Hooks React personnalisés
│   ├── types/                # Types TypeScript
│   └── styles/               # Styles CSS globaux
├── scripts/
│   ├── database/             # Scripts de base de données
│   ├── verification/         # Scripts de test et vérification
│   └── maintenance/          # Scripts de maintenance
├── docs/                     # Documentation
├── supabase/migrations/      # Migrations base de données
└── public/                   # Assets statiques
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Vercel (pour le déploiement)

### Configuration
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement dans `.env`
4. Appliquer les migrations Supabase
5. Démarrer en développement : `npm run dev`

### Variables d'Environnement
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## 📊 Workflows Métier

### Workflow CB (Contrôleur Budgétaire)
- Validation des contrôles de fond
- Vérification des types d'opérations
- Validation ou rejet des dossiers

### Workflow Ordonnateur
- Vérifications spécifiques par catégories
- Validation des montants et bénéficiaires
- Ordonnancement des dossiers validés

### Workflow Agent Comptable
- Révision complète des validations précédentes
- Validation définitive des dossiers
- Génération des quitus officiels

## 🖨️ Système de Quitus

- Format A4 professionnel
- Logo ACGE intégré
- Marges optimisées (15mm latérales)
- Suppression des en-têtes/pieds navigateur
- Export PDF natif du navigateur
- Archivage automatique en base de données

## 🔐 Sécurité

- Row Level Security (RLS) activé
- Authentification robuste NextAuth
- Protection des routes par rôles
- Validation des permissions API
- Chiffrement des données sensibles

## 📈 Performance

- Lazy loading des composants
- Optimisation des images
- Cache des requêtes
- Speed Insights intégré
- Bundle optimisé pour la production

## 🚀 Déploiement

1. Push vers GitHub
2. Connecter à Vercel
3. Configurer les variables d'environnement
4. Déploiement automatique

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation dans `docs/`
- Vérifier les logs d'erreur
- Contacter l'équipe de développement

## 📄 Licence

Propriété de l'Agence Comptable des Grandes Écoles du Gabon.

---

**Développé avec ❤️ pour l'ACGE**
