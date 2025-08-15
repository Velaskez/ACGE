# 🔧 Guide de Configuration Supabase en Production

## ⚠️ **PROBLÈME ACTUEL**

L'upload ne fonctionne pas car **Supabase n'est pas configuré** en production.

## 🎯 **Variables d'Environnement Requises**

### **Dans Vercel, ajouter ces variables :**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[votre-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[votre-service-role-key]
```

## 📋 **Étapes de Configuration**

### **1. Créer un Projet Supabase**
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et les clés

### **2. Configurer le Storage**
1. Dans le dashboard Supabase
2. Aller dans **Storage**
3. Créer un bucket nommé `documents`
4. Configurer les permissions :
   ```sql
   -- Permettre l'upload aux utilisateurs authentifiés
   CREATE POLICY "Users can upload documents" ON storage.objects
   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Permettre la lecture des documents
   CREATE POLICY "Users can view documents" ON storage.objects
   FOR SELECT USING (true);
   ```

### **3. Configurer Vercel**
1. Aller dans le dashboard Vercel
2. Sélectionner votre projet
3. Aller dans **Settings > Environment Variables**
4. Ajouter les 3 variables Supabase

### **4. Redéployer**
```bash
git push origin master
```

## 🔍 **Vérification**

### **Test de Configuration**
```bash
curl https://acge-gabon.com/api/test-db
```

### **Test d'Upload**
1. Aller sur `/upload`
2. Tenter d'uploader un fichier
3. Vérifier les logs Vercel

## 🛠️ **Dépannage**

### **Si l'upload ne fonctionne toujours pas :**

1. **Vérifier les logs Vercel** :
   - Dashboard Vercel > Functions > Logs
   - Chercher les erreurs Supabase

2. **Tester la connexion Supabase** :
   ```bash
   curl -X POST https://acge-gabon.com/api/upload \
     -H "Content-Type: multipart/form-data" \
     -F "files=@test.txt" \
     -F "metadata={\"name\":\"test\"}"
   ```

3. **Vérifier les variables d'environnement** :
   - Dashboard Vercel > Settings > Environment Variables
   - S'assurer que toutes les variables sont présentes

## ✅ **Résultat Attendu**

Après configuration :
- ✅ **Upload fonctionnel** vers Supabase Storage
- ✅ **Fichiers accessibles** via URLs publiques
- ✅ **Base de données** synchronisée
- ✅ **Interface** qui fonctionne correctement

## 🚨 **Important**

**Ne pas utiliser de solution temporaire !** 
Cette configuration Supabase est **définitive** et **scalable**.
