# 🗄️ **Solution Base de Données Durable - ACGE**

## 📋 **Problème Résolu**

Le système avait des problèmes de configuration de base de données qui empêchaient le déploiement du nouveau système de dossiers comptables.

## ✅ **Solution Mise en Place**

### **1. Architecture Respectée**
- **Développement** : SQLite local (`file:./prisma/dev.db`)
- **Production** : PostgreSQL Supabase (configuration sauvegardée)
- **Schémas séparés** : `schema.prisma` (PostgreSQL) et `schema.sqlite.prisma` (SQLite)

### **2. Configuration de Développement**
```bash
# Fichier .env pour développement
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-secret-key-for-local-testing"
NEXTAUTH_URL="http://localhost:3000"
```

### **3. Scripts de Gestion**
- `switch-to-dev.bat` : Bascule vers le développement
- `restore-production-env.bat` : Restaure la configuration production
- `create-env-local-dev.ps1` : Crée la configuration de développement

## 🔧 **Nouvelles Tables Ajoutées**

### **PosteComptable**
```sql
- id (String, @id, @default(cuid()))
- numero (String, @unique)
- intitule (String)
- isActive (Boolean, @default(true))
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
```

### **NatureDocument**
```sql
- id (String, @id, @default(cuid()))
- numero (String, @unique)
- nom (String)
- description (String?)
- isActive (Boolean, @default(true))
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
```

### **Dossier**
```sql
- id (String, @id, @default(cuid()))
- numeroDossier (String, @unique) // DOSS-ACGE-AAAANNN
- dateDepot (DateTime, @default(now()))
- numeroNature (String)
- objetOperation (String)
- beneficiaire (String)
- statut (String, @default("EN_ATTENTE"))
- posteComptableId (String)
- natureDocumentId (String)
- secretaireId (String)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
```

### **ValidationDossier**
```sql
- id (String, @id, @default(cuid()))
- statut (String) // VALIDE, REJETE
- commentaire (String?)
- dateValidation (DateTime, @default(now()))
- dossierId (String)
- validateurId (String)
```

## 📊 **Données de Test Disponibles**

### **Postes Comptables (7)**
1. 4855 - ENS
2. 4856 - ENSET
3. 4857 - INSG
4. 4858 - IUSO
5. 4860 - ENA
6. 4861 - EPCA
7. 4862 - IEF

### **Natures de Documents (10)**
1. 01 - Ordre de recettes
2. 02 - Ordre de paiement
3. 03 - Courrier
4. 04 - Facture
5. 05 - Devis
6. 06 - Bon de commande
7. 07 - Bordereau
8. 08 - Attestation
9. 09 - Convention
10. 10 - Rapport

## 🚀 **Utilisation**

### **Développement Local**
```bash
# Basculer vers le développement
.\switch-to-dev.bat

# Basculer vers SQLite
.\switch-to-sqlite.bat

# Pousser le schéma SQLite
npx prisma db push

# Ajouter les données de test
npm run seed:comptable

# Démarrer le serveur
npm run dev
```

### **Production**
```bash
# Restaurer la configuration production
.\restore-production-env.bat

# Restaurer le schéma PostgreSQL
.\restore-postgresql-schema.bat

# Pousser le schéma PostgreSQL
npx prisma db push
```

## 🔄 **Workflow de Développement**

1. **Développement** : Utiliser SQLite local avec `switch-to-sqlite.bat`
2. **Tests** : Données de test disponibles
3. **Production** : Basculer vers PostgreSQL avec `restore-postgresql-schema.bat`
4. **Migration** : Schémas synchronisés

## 📁 **Fichiers Modifiés**

### **Nouveaux Fichiers**
- `prisma/schema.sqlite.prisma` : Schéma SQLite complet
- `scripts/seed-comptable-data.ts` : Script de seeding
- `switch-to-dev.bat` : Script de basculement environnement
- `restore-production-env.bat` : Script de restauration environnement
- `switch-to-sqlite.bat` : Script de basculement vers SQLite
- `restore-postgresql-schema.bat` : Script de restauration PostgreSQL
- `src/app/api/documents/dossiers-comptables/route.ts` : API dossiers comptables
- `src/app/api/documents/postes-comptables/route.ts` : API postes comptables
- `src/app/api/documents/natures-documents/route.ts` : API natures documents

### **Fichiers Modifiés**
- `prisma/schema.prisma` : Maintenant configuré pour SQLite en développement
- `src/app/(protected)/documents/page.tsx` : Interface documents avec onglets (Documents + Dossiers Comptables)
- `src/components/layout/sidebar.tsx` : Navigation simplifiée
- `src/types/index.ts` : Types étendus
- `package.json` : Script de seeding ajouté

### **Fichiers Supprimés**
- `src/app/(protected)/dossiers/page.tsx` : Page séparée supprimée
- `src/app/api/dossiers/route.ts` : API séparée supprimée
- `src/app/api/postes-comptables/route.ts` : API séparée supprimée
- `src/app/api/natures-documents/route.ts` : API séparée supprimée

## ✅ **Avantages de cette Solution**

1. **Durabilité** : Configuration stable et maintenable
2. **Flexibilité** : Basculement facile entre dev et prod
3. **Sécurité** : Sauvegarde automatique des configurations
4. **Performance** : SQLite rapide pour le développement
5. **Compatibilité** : Respect de l'architecture existante
6. **Intégration** : Système de dossiers comptables intégré dans la page documents existante
7. **Données Réelles** : Postes comptables mis à jour avec les vraies données
8. **Gestion des Schémas** : Scripts automatiques pour basculer entre SQLite et PostgreSQL

## 🎯 **État Actuel**

- ✅ Base de données SQLite fonctionnelle
- ✅ Données de test mises à jour (7 postes comptables réels)
- ✅ APIs opérationnelles (intégrées dans /api/documents/)
- ✅ Interface utilisateur intégrée (onglets dans la page documents)
- ✅ Scripts de gestion créés
- ✅ Configuration production sauvegardée
- ✅ Navigation simplifiée
- ✅ Schéma Prisma configuré pour SQLite
- ✅ Client Prisma régénéré

**Le système est maintenant prêt pour le développement et la production !**
