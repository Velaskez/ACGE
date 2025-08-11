# Configuration de Déploiement

## Variables d'Environnement pour la Production

Voici les variables d'environnement à configurer sur votre plateforme de déploiement :

### Railway.app
```bash
# Base de données (sera automatiquement fournie par Railway)
DATABASE_URL=postgresql://username:password@hostname:port/database

# NextAuth - Clé secrète
NEXTAUTH_SECRET=flJt0xsoOZ6QrLHlED23kNPDCaOWtzOLeTmM9dnNEts=

# URL de l'application (à mettre à jour après déploiement)
NEXTAUTH_URL=https://votre-app.railway.app
NEXT_PUBLIC_API_URL=https://votre-app.railway.app
```

### Render.com
```bash
# Mêmes variables que Railway
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_SECRET=flJt0xsoOZ6QrLHlED23kNPDCaOWtzOLeTmM9dnNEts=
NEXTAUTH_URL=https://votre-app.onrender.com
NEXT_PUBLIC_API_URL=https://votre-app.onrender.com
```

### Fly.io
```bash
# Mêmes variables
DATABASE_URL=postgresql://username:password@hostname:port/database
NEXTAUTH_SECRET=flJt0xsoOZ6QrLHlED23kNPDCaOWtzOLeTmM9dnNEts=
NEXTAUTH_URL=https://votre-app.fly.dev
NEXT_PUBLIC_API_URL=https://votre-app.fly.dev
```

## Scripts de Build et de Migration

Le projet utilise les scripts suivants pour la production :

- `npm run build` : Build de production Next.js
- `npm run db:deploy` : Migration Prisma pour la production
- `npm start` : Démarrage du serveur de production

## Note sur la Base de Données

Votre schéma Prisma est configuré pour PostgreSQL. Les plateformes comme Railway, Render, et Fly.io fournissent automatiquement une base de données PostgreSQL et configurent la variable `DATABASE_URL`.
