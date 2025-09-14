-- Script SQL pour appliquer la contrainte unique manuellement
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Nettoyer les doublons existants avant d'ajouter la contrainte
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, title, message, created_at 
           ORDER BY created_at DESC, id DESC
         ) as rn
  FROM public.notifications
)
DELETE FROM public.notifications 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Ajouter la contrainte unique
ALTER TABLE public.notifications 
ADD CONSTRAINT unique_notification_content 
UNIQUE (user_id, title, message, created_at);

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_deduplication 
ON public.notifications(user_id, title, message, created_at);

-- 4. Créer une fonction pour nettoyer les notifications expirées
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 5. Créer une fonction pour nettoyer les notifications anciennes (plus de 30 jours)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_read = true;
END;
$$ LANGUAGE plpgsql;

-- 6. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Appliquer le trigger
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 8. Exécuter le nettoyage initial
SELECT cleanup_expired_notifications();
SELECT cleanup_old_notifications();

-- 9. Vérifier les résultats
SELECT 
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = false) as unread_count,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as recent_count
FROM public.notifications;
