-- VSHub App Store + Community Messaging schema
-- Run in Supabase SQL editor (once).

-- ─── VSHub App Store ──────────────────────────────────────────────────────────

create table if not exists public.vshub_apps (
  id uuid primary key default gen_random_uuid(),
  builder_id uuid references auth.users on delete set null,
  title text not null,
  description text,
  url text,
  tags text[] default '{}',
  likes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.vshub_reviews (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.vshub_apps(id) on delete cascade,
  reviewer_id uuid references auth.users on delete set null,
  rating int check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_vshub_apps_created on public.vshub_apps (created_at desc);
create index if not exists idx_vshub_reviews_app on public.vshub_reviews (app_id);

-- RLS
alter table public.vshub_apps enable row level security;
alter table public.vshub_reviews enable row level security;

drop policy if exists vshub_apps_select on public.vshub_apps;
create policy vshub_apps_select on public.vshub_apps for select to anon, authenticated using (true);

drop policy if exists vshub_apps_insert on public.vshub_apps;
create policy vshub_apps_insert on public.vshub_apps for insert to anon, authenticated with check (true);

drop policy if exists vshub_apps_update_likes on public.vshub_apps;
create policy vshub_apps_update_likes on public.vshub_apps for update to anon, authenticated using (true) with check (true);

drop policy if exists vshub_reviews_select on public.vshub_reviews;
create policy vshub_reviews_select on public.vshub_reviews for select to anon, authenticated using (true);

drop policy if exists vshub_reviews_insert on public.vshub_reviews;
create policy vshub_reviews_insert on public.vshub_reviews for insert to anon, authenticated with check (true);

grant select, insert, update on public.vshub_apps to anon, authenticated;
grant select, insert on public.vshub_reviews to anon, authenticated;

-- ─── Community Messaging ──────────────────────────────────────────────────────

create table if not exists public.messages (
  id bigserial primary key,
  channel text not null default 'general',
  sender_id uuid references auth.users on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_channel_created on public.messages (channel, created_at desc);

alter table public.messages enable row level security;

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages for select to anon, authenticated using (true);

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert to anon, authenticated with check (true);

grant select, insert on public.messages to anon, authenticated;

-- Enable realtime for messages
-- Run this separately in the Supabase dashboard under Database → Replication:
--   alter publication supabase_realtime add table public.messages;
