# 🎉 Configuration Supabase Storage - FINAL

## ✅ **Ce qui est déjà fait :**
- ✅ SDK Supabase installé
- ✅ Routes API créées (upload/download)
- ✅ Bucket "documents" créé
- ✅ Test d'upload réussi
- ✅ CLI Supabase configuré

## 📋 **Variables d'environnement à ajouter :**

### **Sur Vercel (production) :**
```
NEXT_PUBLIC_SUPABASE_URL="https://wodyrsasfqfoqdydrfew.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0"
```

### **En local (.env.local) :**
```
NEXT_PUBLIC_SUPABASE_URL="https://wodyrsasfqfoqdydrfew.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0"
```

## 🔒 **Configuration des politiques de sécurité (MANUEL) :**

### **1. Aller sur le dashboard Supabase :**
- https://supabase.com/dashboard/project/wodyrsasfqfoqdydrfew

### **2. Aller dans Storage > Policies**

### **3. Ajouter les politiques suivantes :**

#### **Politique 1 - Upload (INSERT) :**
```sql
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Politique 2 - Download (SELECT) :**
```sql
CREATE POLICY "Users can download their own files" ON storage.objects
FOR SELECT USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **Politique 3 - Delete (DELETE) :**
```sql
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🚀 **Déploiement final :**

### **1. Ajouter les variables sur Vercel :**
1. Allez dans votre projet Vercel
2. Settings > Environment Variables
3. Ajoutez les 3 variables ci-dessus
4. Redeploy l'application

### **2. Test de l'application :**
1. **Test d'upload** : Allez dans Upload et testez l'upload d'un fichier
2. **Test de download** : Allez dans Documents et testez le download
3. **Test des versions** : Testez l'historique des versions

## 🧪 **Test rapide avec CLI :**

```bash
# Test d'upload
npx tsx scripts/setup-storage-with-keys.ts

# Vérifier le bucket
npx supabase storage ls --bucket documents
```

## 📊 **Monitoring :**

### **Dans Supabase Dashboard :**
- **Storage > Logs** : Voir les opérations de stockage
- **Storage > Usage** : Voir l'utilisation du stockage
- **Database > Logs** : Voir les requêtes de base de données

### **Dans Vercel :**
- **Functions > Logs** : Voir les logs des API routes
- **Analytics** : Voir les performances

## 🎯 **Résumé de la migration :**

### **Avant (LWS) :**
- ❌ Stockage local (ne fonctionne pas sur Vercel)
- ❌ FTP limité
- ❌ Pas de scalabilité

### **Après (Supabase) :**
- ✅ Stockage cloud scalable
- ✅ API moderne et sécurisée
- ✅ Intégration parfaite avec PostgreSQL
- ✅ CDN global pour les performances
- ✅ Gratuit dans les limites du plan

## 🔧 **En cas de problème :**

### **Erreur "Bucket not found" :**
- Vérifiez que le bucket "documents" existe dans Supabase Storage

### **Erreur "Permission denied" :**
- Vérifiez que les politiques de sécurité sont configurées
- Vérifiez que l'utilisateur est authentifié

### **Erreur "Missing environment variables" :**
- Vérifiez que les variables sont bien définies sur Vercel
- Redémarrez le serveur de développement

## 🎉 **Félicitations !**

Votre application utilise maintenant **Supabase Storage** pour un stockage de fichiers moderne, sécurisé et scalable ! 🚀
