-- Créer la table notifications avec la structure correcte
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  type text default 'info',
  user_id text not null, -- TEXT pour compatibilité avec les IDs existants
  data jsonb default '{}',
  is_read boolean default false not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Créer les index pour les performances
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_created_at on public.notifications(created_at);

-- Activer Row Level Security (obligatoire selon la doc)
alter table public.notifications enable row level security;

-- Politique pour que les utilisateurs voient leurs propres notifications
create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid()::text);

-- Politique pour que les utilisateurs mettent à jour leurs propres notifications
create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid()::text)
with check (user_id = auth.uid()::text);

-- Politique pour que le service role puisse insérer des notifications
create policy "Service role can insert notifications"
on public.notifications
for insert
to service_role
with check (true);

-- Politique pour que le service role puisse supprimer des notifications
create policy "Service role can delete notifications"
on public.notifications
for delete
to service_role
using (true);

-- Fonction pour mettre à jour updated_at automatiquement
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger pour updated_at
create trigger handle_notifications_updated_at
  before update on public.notifications
  for each row
  execute function public.handle_updated_at();
