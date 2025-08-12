# Guide de Dépannage ACGE

## 🚨 Erreurs Résolues - 10 janvier 2025

### Problème Initial
```
Error: Erreur lors de la récupération des données
Error: Erreur lors de la récupération des statistiques
```

### Solutions Appliquées

#### 1. ✅ Configuration Base de Données
- **Problème**: Table `users` inexistante
- **Solution**: Recréation complète de la base SQLite
```bash
npx prisma db push --force-reset
npx tsx scripts/create-test-user.ts
```

#### 2. ✅ Signature JWT Invalide
- **Problème**: Mismatch entre secrets JWT de signature et vérification
- **Solution**: Unification des secrets dans `.env.local`
```env
NEXTAUTH_SECRET=unified-jwt-secret-for-development
DATABASE_URL=file:./dev.db
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

#### 3. ✅ Port du Serveur
- **Problème**: Tests dirigés vers le mauvais port (3003 vs 3000)
- **Solution**: Correction des URLs de test vers `http://localhost:3000`

## 🔧 Scripts de Diagnostic

### Test Complet des APIs
```bash
npx tsx scripts/test-final-apis.ts
```

### Vérification de Santé
```bash
npx tsx scripts/health-check.ts
```

### Recréation Utilisateur Test
```bash
npx tsx scripts/create-test-user.ts
```

## 📊 État Final
- ✅ Login fonctionnel (admin@test.com / admin123)
- ✅ Dashboard Stats: 1 document, 1 dossier, 1 utilisateur
- ✅ Dashboard Activity: 2 activités
- ✅ Sidebar Folders: 1 dossier
- ✅ JWT unifié et fonctionnel
- ✅ Base de données SQLite opérationnelle

## 🚀 Démarrage Rapide
1. `npm run dev` - Démarrer le serveur
2. Aller sur `http://localhost:3000`
3. Se connecter avec `admin@test.com` / `admin123`
4. Les erreurs de récupération des données sont résolues

## 🔍 En Cas de Problème Futur
1. Exécuter `npx tsx scripts/health-check.ts`
2. Vérifier que `.env.local` existe et contient les bonnes valeurs
3. Si erreur DB: `npx prisma db push --force-reset`
4. Si erreur JWT: Vérifier la cohérence des secrets
5. Si erreur de port: Vérifier quel port utilise Next.js au démarrage
