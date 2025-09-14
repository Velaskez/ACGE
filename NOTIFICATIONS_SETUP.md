# 🔔 Configuration du système de notifications

## 📋 Vue d'ensemble

Le système de notifications a été implémenté dans l'application ACGE avec les fonctionnalités suivantes :

- ✅ **Types TypeScript** : Interfaces complètes pour les notifications
- ✅ **Hook personnalisé** : `useNotifications` pour gérer les notifications
- ✅ **Interface utilisateur** : Section dans la sidebar et page dédiée
- ✅ **Pages d'aide** : Documentation et support technique
- ⚠️ **Table Supabase** : À créer manuellement (voir instructions ci-dessous)

## 🗄️ Création de la table notifications

### Méthode 1 : Via l'interface Supabase (Recommandée)

1. **Accédez à votre projet Supabase** : https://supabase.com/dashboard
2. **Ouvrez l'éditeur SQL** : Cliquez sur "SQL Editor" dans le menu de gauche
3. **Exécutez le script suivant** :

```sql
-- Créer le type enum pour les types de notifications
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'INFO',           -- Information générale
    'WARNING',        -- Avertissement
    'ERROR',          -- Erreur
    'SUCCESS',        -- Succès
    'VALIDATION',     -- Demande de validation
    'REJECTION',      -- Rejet de dossier
    'APPROVAL',       -- Approbation de dossier
    'SYSTEM'          -- Notification système
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer le type enum pour les priorités
DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM (
    'LOW',            -- Priorité faible
    'MEDIUM',         -- Priorité moyenne
    'HIGH',           -- Priorité élevée
    'URGENT'          -- Priorité urgente
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'INFO',
  priority notification_priority NOT NULL DEFAULT 'MEDIUM',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT, -- URL vers la page concernée
  action_label TEXT, -- Label du bouton d'action
  metadata JSONB, -- Données supplémentaires (ex: dossier_id, document_id)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at);

-- Créer un index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Permissions
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO postgres;

-- RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can delete notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can delete notifications" ON public.notifications
  FOR DELETE USING (auth.jwt()->>'role' = 'service_role');
```

4. **Cliquez sur "Run"** pour exécuter le script
5. **Vérifiez** que la table a été créée dans l'onglet "Table Editor"

### Méthode 2 : Via la ligne de commande (Alternative)

Si vous avez accès à la base de données PostgreSQL directement :

```bash
# Se connecter à la base de données
psql -h your-db-host -U postgres -d postgres

# Exécuter le script SQL ci-dessus
```

## 🧪 Test du système

Après avoir créé la table, testez le système :

1. **Redémarrez l'application** : `npm run dev`
2. **Vérifiez la sidebar** : La section notifications devrait s'afficher
3. **Accédez à `/notifications`** : La page dédiée devrait fonctionner
4. **Testez les fonctions** : Marquer comme lu, filtres, etc.

## 📱 Fonctionnalités disponibles

### Dans la sidebar
- **Aperçu des notifications** : 3 dernières notifications
- **Compteur de notifications non lues** : Badge rouge avec le nombre
- **Marquage rapide** : Cliquer sur une notification la marque comme lue

### Page dédiée (`/notifications`)
- **Liste complète** : Toutes les notifications de l'utilisateur
- **Filtres avancés** : Par type, priorité, statut
- **Recherche** : Par titre ou message
- **Actions en lot** : Marquer toutes comme lues
- **Statistiques** : Compteurs détaillés

### Pages d'aide
- **`/help`** : Documentation complète
- **`/support`** : Formulaire de contact

## 🔧 Configuration avancée

### Types de notifications
- `INFO` : Information générale
- `WARNING` : Avertissement
- `ERROR` : Erreur
- `SUCCESS` : Succès
- `VALIDATION` : Demande de validation
- `REJECTION` : Rejet de dossier
- `APPROVAL` : Approbation de dossier
- `SYSTEM` : Notification système

### Priorités
- `LOW` : Priorité faible
- `MEDIUM` : Priorité moyenne
- `HIGH` : Priorité élevée
- `URGENT` : Priorité urgente

### Utilisation programmatique

```typescript
import { useNotifications } from '@/hooks/use-notifications'

function MyComponent() {
  const { 
    notifications, 
    stats, 
    markAsRead, 
    createNotification 
  } = useNotifications()

  // Créer une notification
  const handleCreateNotification = async () => {
    await createNotification({
      userId: 'user-id',
      title: 'Nouveau dossier',
      message: 'Un nouveau dossier a été créé',
      type: 'INFO',
      priority: 'MEDIUM'
    })
  }

  return (
    <div>
      <p>Notifications non lues : {stats?.unreadCount}</p>
      {/* ... */}
    </div>
  )
}
```

## 🐛 Dépannage

### Problème : "Table notifications does not exist"
**Solution** : Exécutez le script SQL ci-dessus dans Supabase

### Problème : "Permission denied"
**Solution** : Vérifiez que les politiques RLS sont correctement configurées

### Problème : Notifications ne s'affichent pas
**Solution** : 
1. Vérifiez que l'utilisateur est connecté
2. Vérifiez la console pour les erreurs
3. Redémarrez l'application

## 📞 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** : Console du navigateur et terminal
2. **Consultez la documentation** : Page `/help`
3. **Contactez le support** : Page `/support`

---

**Note** : Le système de notifications est maintenant prêt à être utilisé ! Il suffit de créer la table dans Supabase pour activer toutes les fonctionnalités.
