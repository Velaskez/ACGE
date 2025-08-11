# Guide de Débogage Vercel - ACGE

## 🚨 Problème : "Email ou mot de passe incorrect"

### Causes possibles :
1. **Base de données non configurée** sur Vercel
2. **Migrations non appliquées** en production
3. **Utilisateur admin non créé** en production
4. **Variables d'environnement manquantes**

---

## 🔧 Solutions pas à pas

### Étape 1 : Vérifier les variables d'environnement Vercel

Dans votre dashboard Vercel :
1. Allez dans **Settings** → **Environment Variables**
2. Vérifiez que vous avez :
   ```bash
   DATABASE_URL=postgresql://username:password@hostname:port/database
   NEXTAUTH_SECRET=flJt0xsoOZ6QrLHlED23kNPDCaOWtzOLeTmM9dnNEts=
   NEXTAUTH_URL=https://votre-app.vercel.app
   SETUP_SECRET_KEY=votre-cle-secrete-temporaire
   ```

### Étape 2 : Configurer la base de données

#### Option A : Vercel Postgres (Recommandée)
1. Dans Vercel, aller dans **Storage**
2. Créer une **Postgres Database**
3. La `DATABASE_URL` sera automatiquement configurée

#### Option B : Base externe (Neon, Supabase, etc.)
1. Créer une base PostgreSQL sur Neon.tech ou Supabase
2. Copier l'URL de connexion dans `DATABASE_URL`

### Étape 3 : Appliquer les migrations

Dans le terminal local :
```bash
# Configurer l'URL de production
export DATABASE_URL="votre-url-production"

# Appliquer les migrations
npm run db:deploy

# Générer le client Prisma
npm run db:generate
```

### Étape 4 : Créer l'admin via API

Une fois déployé, appelez cette URL **UNE SEULE FOIS** :
```
POST https://votre-app.vercel.app/api/setup-admin?key=votre-cle-secrete
```

Ou avec curl :
```bash
curl -X POST "https://votre-app.vercel.app/api/setup-admin?key=votre-cle-secrete"
```

### Étape 5 : Test de connexion

Essayez de vous connecter avec :
- **Email** : `admin@acge.ga`
- **Mot de passe** : `admin123`

---

## 🔍 Diagnostic avancé

### Vérifier les logs Vercel
1. Aller dans **Functions** → **View Logs**
2. Chercher les erreurs liées à Prisma ou à la base

### Tester la base de données
Visitez : `https://votre-app.vercel.app/api/health`

Réponse attendue :
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T...",
  "version": "1.0.0"
}
```

### Erreurs communes

#### `P1001: Can't reach database server`
- Vérifier `DATABASE_URL`
- Vérifier que la base existe
- Vérifier les permissions réseau

#### `P3009: migrate found failed migration`
```bash
# Réinitialiser les migrations
npx prisma migrate reset --force
npx prisma db push
```

#### `Invalid `prisma.user.findUnique()` invocation`
- Régénérer le client : `npm run db:generate`
- Redéployer sur Vercel

---

## 📋 Checklist de dépannage

- [ ] Variables d'environnement configurées sur Vercel
- [ ] Base de données PostgreSQL créée
- [ ] `DATABASE_URL` correcte et accessible
- [ ] Migrations appliquées (`npm run db:deploy`)
- [ ] API setup-admin appelée
- [ ] Test de connexion effectué
- [ ] Logs Vercel vérifiés

---

## 🆘 Si rien ne fonctionne

1. **Supprimer et recréer** la base de données
2. **Redéployer** complètement sur Vercel
3. **Appliquer** les migrations à nouveau
4. **Recréer** l'admin via l'API

## 📞 URLs utiles

- **Health check** : `/api/health`
- **Setup admin** : `/api/setup-admin?key=SECRET`
- **Login** : `/login`

---

## 🔐 Sécurité

⚠️ **Important** : Après avoir créé l'admin, supprimez la variable `SETUP_SECRET_KEY` de Vercel pour des raisons de sécurité.
