-- 1. Create Buckets
-- Note: 'public' sets whether the files are publicly accessible via URL without a signed token.
insert into storage.buckets (id, name, public)
values 
  ('submissions', 'submissions', true),
  ('builder_certificates', 'builder_certificates', true),
  ('builder_showcase', 'builder_showcase', true)
on conflict (id) do nothing;

-- 2. Set up RLS Policies for 'submissions' bucket

-- Allow Public Read
drop policy if exists "Public Read Submissions" on storage.objects;
create policy "Public Read Submissions"
on storage.objects for select
using (bucket_id = 'submissions');

-- Allow Authenticated Uploads
drop policy if exists "Authenticated Upload Submissions" on storage.objects;
create policy "Authenticated Upload Submissions"
on storage.objects for insert
to authenticated
with check (bucket_id = 'submissions');

-- Allow Owners to Delete/Update their own files
drop policy if exists "Owner File Management" on storage.objects;
create policy "Owner File Management"
on storage.objects for all
to authenticated
using (bucket_id = 'submissions' and (select auth.uid())::text = split_part(name, '-', 1))
with check (bucket_id = 'submissions' and (select auth.uid())::text = split_part(name, '-', 1));

-- 3. Set up RLS Policies for 'builder_showcase' bucket
drop policy if exists "Public Read Showcase" on storage.objects;
create policy "Public Read Showcase"
on storage.objects for select
using (bucket_id = 'builder_showcase');

drop policy if exists "Authenticated Upload Showcase" on storage.objects;
create policy "Authenticated Upload Showcase"
on storage.objects for insert
to authenticated
with check (bucket_id = 'builder_showcase');
