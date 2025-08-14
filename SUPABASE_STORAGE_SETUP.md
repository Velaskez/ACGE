# 🗂️ Configuration Supabase Storage

## 📋 Variables d'environnement à ajouter

### Dans `.env.local` (développement local) :
```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL="https://wodyrsasfqfoqdydrfew.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="VOTRE_CLE_ANON_SUPABASE"
SUPABASE_SERVICE_ROLE_KEY="VOTRE_CLE_SERVICE_ROLE_SUPABASE"
```

### Sur Vercel (production) :
- `NEXT_PUBLIC_SUPABASE_URL` = `https://wodyrsasfqfoqdydrfew.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Votre clé anon publique
- `SUPABASE_SERVICE_ROLE_KEY` = Votre clé service role privée

## 🔑 Récupération des clés Supabase

1. **Connectez-vous à votre dashboard Supabase** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `wodyrsasfqfoqdydrfew`
3. **Allez dans Settings > API**
4. **Copiez les clés** :
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

## 🗂️ Configuration du bucket Storage

### 1. Créer le bucket "documents"
1. **Allez dans Storage** dans votre dashboard Supabase
2. **Cliquez sur "New bucket"**
3. **Nom** : `documents`
4. **Public bucket** : ✅ Activé
5. **File size limit** : `50MB`
6. **Allowed MIME types** : `*/*`

### 2. Configurer les politiques de sécurité

#### Politique pour l'upload (INSERT) :
```sql
-- Permettre l'upload aux utilisateurs authentifiés
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique pour le download (SELECT) :
```sql
-- Permettre le download aux utilisateurs authentifiés
CREATE POLICY "Users can download their own files" ON storage.objects
FOR SELECT USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Politique pour la suppression (DELETE) :
```sql
-- Permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🧪 Test de la configuration

### 1. Test local
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### 2. Test d'upload
1. **Connectez-vous** à l'application
2. **Allez dans Upload**
3. **Sélectionnez un fichier**
4. **Vérifiez** que l'upload fonctionne

### 3. Test de download
1. **Allez dans Documents**
2. **Cliquez sur Download** d'un document
3. **Vérifiez** que le téléchargement fonctionne

## 🔧 Dépannage

### Erreur "Missing Supabase environment variables"
- Vérifiez que les variables d'environnement sont bien définies
- Redémarrez le serveur de développement

### Erreur "Bucket not found"
- Vérifiez que le bucket "documents" existe dans Supabase
- Vérifiez les politiques de sécurité

### Erreur "Permission denied"
- Vérifiez que l'utilisateur est authentifié
- Vérifiez les politiques RLS (Row Level Security)

## 📊 Monitoring

### Dans Supabase Dashboard :
1. **Storage > Logs** : Voir les opérations de stockage
2. **Storage > Usage** : Voir l'utilisation du stockage
3. **Database > Logs** : Voir les requêtes de base de données

## 🚀 Déploiement

### 1. Ajouter les variables sur Vercel
1. **Allez dans votre projet Vercel**
2. **Settings > Environment Variables**
3. **Ajoutez** les 3 variables Supabase
4. **Redeploy** l'application

### 2. Vérifier le déploiement
1. **Testez l'upload** sur l'application déployée
2. **Testez le download** sur l'application déployée
3. **Vérifiez les logs** dans Vercel

## 📈 Avantages de Supabase Storage

- ✅ **Intégration native** avec votre base PostgreSQL
- ✅ **API simple** et moderne
- ✅ **Sécurité** intégrée avec RLS
- ✅ **Scalabilité** automatique
- ✅ **Gratuit** dans les limites de votre plan
- ✅ **CDN global** pour les performances
