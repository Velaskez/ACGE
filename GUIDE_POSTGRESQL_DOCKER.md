# 🐘 Guide Complet PostgreSQL Docker - ACGE

## ✅ État Actuel
- ✅ PostgreSQL Docker opérationnel
- ✅ Tables créées et données de test ajoutées
- ✅ pgAdmin interface web disponible
- ✅ Base de données accessible depuis l'extérieur

## 🌐 Méthodes d'Accès à la Base

### 🔵 1. pgAdmin (Interface Web - RECOMMANDÉ)

**Accès à pgAdmin:**
- 🌐 **URL**: http://localhost:8080
- 👤 **Email**: admin@acge.local
- 🔑 **Password**: admin123

**Connexion à la base PostgreSQL:**
Une fois dans pgAdmin, créez une nouvelle connexion avec :
- 🖥️ **Host**: `acge-postgres` (nom du container)
- 🔌 **Port**: `5432`
- 🗄️ **Database**: `acge_database`
- 👤 **Username**: `acge_user`
- 🔑 **Password**: `acge_password_dev`

### 🔵 2. Ligne de Commande (Direct)

**Accès interactif au shell PostgreSQL:**
```bash
docker exec -it acge-postgres psql -U acge_user -d acge_database
```

**Commandes rapides:**
```bash
# Lister les tables
docker exec acge-postgres psql -U acge_user -d acge_database -c "\dt"

# Voir les utilisateurs
docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT * FROM users;"

# Voir les documents
docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT * FROM documents;"

# Voir les dossiers
docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT * FROM folders;"
```

### 🔵 3. Clients Externes (DBeaver, PgAdmin local, etc.)

**Paramètres de connexion:**
- 🖥️ **Host**: `localhost` (ou `127.0.0.1`)
- 🔌 **Port**: `5432`
- 🗄️ **Database**: `acge_database`
- 👤 **Username**: `acge_user`
- 🔑 **Password**: `acge_password_dev`

### 🔵 4. Prisma Studio

**Interface visuelle pour Prisma:**
```bash
npx prisma studio
```
- 📱 **URL**: http://localhost:5555

## 🔄 Synchronisation avec PostgreSQL Local

### 🟢 Option A: Utiliser PostgreSQL Local (Remplacement)

**Si vous avez PostgreSQL installé localement :**

1. **Créer une base locale:**
   ```bash
   createdb acge_local
   ```

2. **Modifier `.env.local`:**
   ```env
   DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/acge_local"
   ```

3. **Migrer avec Prisma:**
   ```bash
   npx prisma db push
   ```

### 🟡 Option B: Export/Import (Synchronisation)

**Export depuis Docker:**
```bash
# Backup complet
docker exec acge-postgres pg_dump -U acge_user acge_database > backup_docker.sql

# Backup données uniquement
docker exec acge-postgres pg_dump -U acge_user -a acge_database > data_only.sql

# Backup schéma uniquement
docker exec acge-postgres pg_dump -U acge_user -s acge_database > schema_only.sql
```

**Import vers PostgreSQL local:**
```bash
# Importer dans PostgreSQL local (si installé)
psql -U postgres -d acge_local -f backup_docker.sql
```

### 🔴 Option C: Ports Différents (Coexistence)

**Modifier `docker-compose.yml` pour éviter les conflits:**
```yaml
ports:
  - "5433:5432"  # Docker sur port 5433 au lieu de 5432
```

**Accès alors:**
- 🐳 **Docker**: `localhost:5433`
- 🖥️ **Local**: `localhost:5432`

## 💾 Scripts de Backup Automatique

### PowerShell (Windows)
```powershell
# Créer un backup avec timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "acge_backup_$timestamp.sql"
docker exec acge-postgres pg_dump -U acge_user acge_database > $backupFile
Write-Host "✅ Backup créé: $backupFile"
```

### Bash (Linux/Mac)
```bash
#!/bin/bash
# Backup automatique
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="acge_backup_$TIMESTAMP.sql"
docker exec acge-postgres pg_dump -U acge_user acge_database > $BACKUP_FILE
echo "✅ Backup créé: $BACKUP_FILE"
```

## 🛠️ Commandes de Maintenance

### Docker
```bash
# Redémarrer PostgreSQL
docker-compose restart postgres

# Voir les logs
docker-compose logs postgres

# Arrêter PostgreSQL
docker-compose stop postgres

# Supprimer le container (ATTENTION: perte de données)
docker-compose down postgres
```

### Base de Données
```bash
# Vérifier la connexion
docker exec acge-postgres pg_isready -U acge_user -d acge_database

# Analyser la base
docker exec acge-postgres psql -U acge_user -d acge_database -c "ANALYZE;"

# Voir l'espace utilisé
docker exec acge-postgres psql -U acge_user -d acge_database -c "SELECT pg_size_pretty(pg_database_size('acge_database'));"
```

## 📊 Données Actuelles

**Tables créées:**
- ✅ `users` - Utilisateurs
- ✅ `folders` - Dossiers  
- ✅ `documents` - Documents

**Données de test:**
- 👤 **Admin**: admin@test.com / admin123
- 📁 **Dossier**: PostgreSQL Folder
- 📄 **Document**: PostgreSQL Document

## 🎯 Recommandations

### 📈 Pour le Développement
- ✅ **Utilisez Docker** (isolation, reproductibilité)
- ✅ **pgAdmin** pour l'administration visuelle
- ✅ **Backups réguliers** pour sécurité

### 🏭 Pour la Production
- ✅ **PostgreSQL local** ou cloud (Supabase, AWS RDS)
- ✅ **Monitoring** et alertes
- ✅ **Backups automatisés**

### 🔄 Pour la Synchronisation
- ✅ **Scripts automatisés** de backup/restore
- ✅ **Tests réguliers** des restaurations
- ✅ **Documentation** des procédures

## 🆘 Dépannage

### PostgreSQL ne démarre pas
```bash
# Vérifier les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres

# Recréer si nécessaire
docker-compose down postgres && docker-compose up -d postgres
```

### Problème de connexion
```bash
# Vérifier que le port est ouvert
netstat -an | findstr 5432

# Tester la connexion
docker exec acge-postgres pg_isready -U acge_user -d acge_database
```

### Erreur d'authentification
- Vérifiez les credentials dans `.env.local`
- Redémarrez le container PostgreSQL
- Vérifiez les variables d'environnement Docker

---

✅ **Votre PostgreSQL Docker est maintenant complètement opérationnel !**  
🔗 **Accès pgAdmin**: http://localhost:8080  
📱 **Première connexion**: admin@acge.local / admin123
