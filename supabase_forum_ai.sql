-- Forum AI + likes migration for Builders Forum
-- Run in Supabase SQL editor.

create table if not exists public.forum_post_likes (
  id bigserial primary key,
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.forum_reply_likes (
  id bigserial primary key,
  reply_id uuid not null references public.forum_replies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (reply_id, user_id)
);

create index if not exists idx_forum_post_likes_post on public.forum_post_likes(post_id, created_at desc);
create index if not exists idx_forum_reply_likes_reply on public.forum_reply_likes(reply_id, created_at desc);

alter table public.forum_post_likes enable row level security;
alter table public.forum_reply_likes enable row level security;

drop policy if exists forum_post_likes_select on public.forum_post_likes;
create policy forum_post_likes_select on public.forum_post_likes
for select to anon, authenticated
using (true);

drop policy if exists forum_post_likes_insert on public.forum_post_likes;
create policy forum_post_likes_insert on public.forum_post_likes
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists forum_post_likes_delete on public.forum_post_likes;
create policy forum_post_likes_delete on public.forum_post_likes
for delete to authenticated
using (auth.uid() = user_id);

drop policy if exists forum_reply_likes_select on public.forum_reply_likes;
create policy forum_reply_likes_select on public.forum_reply_likes
for select to anon, authenticated
using (true);

drop policy if exists forum_reply_likes_insert on public.forum_reply_likes;
create policy forum_reply_likes_insert on public.forum_reply_likes
for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists forum_reply_likes_delete on public.forum_reply_likes;
create policy forum_reply_likes_delete on public.forum_reply_likes
for delete to authenticated
using (auth.uid() = user_id);

grant select on public.forum_post_likes to anon, authenticated;
grant select on public.forum_reply_likes to anon, authenticated;
grant insert, delete on public.forum_post_likes to authenticated;
grant insert, delete on public.forum_reply_likes to authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
