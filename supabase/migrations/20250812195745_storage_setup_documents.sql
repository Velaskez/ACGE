-- Supabase Storage setup for ACGE documents
-- Based on Supabase docs: creating buckets and RLS policies

-- 1) Create buckets
insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('previews', 'previews', true)
on conflict (id) do nothing;

-- 2) Policies for public previews (read-only public)
drop policy if exists "Public can read previews" on storage.objects;
create policy "Public can read previews"
  on storage.objects for select
  to public
  using ( bucket_id = 'previews' );

-- 3) Policies for authenticated uploads to both buckets
drop policy if exists "Authenticated can upload documents" on storage.objects;
create policy "Authenticated can upload documents"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id in ('documents','previews') );

-- 4) Allow owners to read their own files in documents bucket
-- Assumes we set owner_id when uploading from server side
drop policy if exists "Owner can read their documents" on storage.objects;
create policy "Owner can read their documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents' and owner = (select auth.uid())
  );

-- 5) Allow owners to update/delete their own files
drop policy if exists "Owner can update their documents" on storage.objects;
create policy "Owner can update their documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'documents' and owner = (select auth.uid())
  )
  with check (
    bucket_id = 'documents' and owner = (select auth.uid())
  );

drop policy if exists "Owner can delete their documents" on storage.objects;
create policy "Owner can delete their documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents' and owner = (select auth.uid())
  );

-- 6) Optional: allow listing only inside user's folder within documents bucket
-- This variant scopes by folder name (first segment equals auth.uid())
-- Uncomment if you prefer folder-based isolation over owner_id column
-- create policy "User can list inside own folder"
--   on storage.objects for select
--   to authenticated
--   using (
--     bucket_id = 'documents'
--     and (storage.foldername(name))[1] = (select auth.uid()::text)
--   );


