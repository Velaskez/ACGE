# Configuration des variables d'environnement Vercel

## Variables requises pour le déploiement

Ajoutez ces variables dans les paramètres de votre projet Vercel :

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://wodyrsasfqfoqdydrfew.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjIzNzYsImV4cCI6MjA3MDU5ODM3Nn0.RhB2OMRdddHXWt1lB6NfHxMl1In_U9CPK_hBOU1UlN4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHlyc2FzZnFmb3FkeWRyZmV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAyMjM3NiwiZXhwIjoyMDcwNTk4Mzc2fQ.gZZ3WTWHNLaYBztUXwx4d8uW56CGHlqznOuNvopkka0
```

### NextAuth Configuration
```
NEXTAUTH_SECRET=dev-secret-key-for-local-testing
NEXTAUTH_URL=https://votre-domaine-vercel.vercel.app
```

### API Configuration
```
NEXT_PUBLIC_API_URL=https://votre-domaine-vercel.vercel.app
```

## Instructions pour configurer sur Vercel

1. Allez dans votre projet Vercel
2. Cliquez sur "Settings" → "Environment Variables"
3. Ajoutez chaque variable une par une
4. Assurez-vous que toutes les variables sont activées pour "Production", "Preview", et "Development"
5. Redéployez votre application

## Note importante

- Remplacez `https://votre-domaine-vercel.vercel.app` par votre vraie URL Vercel
- Les clés Supabase sont déjà configurées pour la production
- Le `NEXTAUTH_SECRET` devrait être changé pour la production (générez une clé sécurisée)
