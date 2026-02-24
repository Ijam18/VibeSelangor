-- Certificate Security Hardening
-- Run in Supabase SQL Editor.

-- 1) Table-level RLS for builder_certificates
alter table if exists public.builder_certificates enable row level security;

drop policy if exists "cert_builder_read_own" on public.builder_certificates;
create policy "cert_builder_read_own"
on public.builder_certificates
for select
to authenticated
using (builder_id = auth.uid());

drop policy if exists "cert_admin_full_access" on public.builder_certificates;
create policy "cert_admin_full_access"
on public.builder_certificates
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
);

-- 2) Storage policies for certificate bucket
-- Assumes bucket name: builder_certificates

-- Recommended: make bucket private in UI, then use signed URLs.
-- If bucket stays public, these policies still control object writes/updates/deletes.

drop policy if exists "cert_storage_builder_read_own" on storage.objects;
create policy "cert_storage_builder_read_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'builder_certificates'
  and (
    -- own files path convention: {program_id}/{builder_id}/...
    split_part(name, '/', 2) = auth.uid()::text
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and lower(coalesce(p.role, '')) in ('admin', 'owner')
    )
  )
);

drop policy if exists "cert_storage_admin_write" on storage.objects;
create policy "cert_storage_admin_write"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'builder_certificates'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
);

drop policy if exists "cert_storage_admin_update" on storage.objects;
create policy "cert_storage_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'builder_certificates'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
)
with check (
  bucket_id = 'builder_certificates'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
);

drop policy if exists "cert_storage_admin_delete" on storage.objects;
create policy "cert_storage_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'builder_certificates'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('admin', 'owner')
  )
);

