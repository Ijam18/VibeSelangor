-- ============================================================
-- VibeSelangor — Complete Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Safe to re-run: uses IF NOT EXISTS + DO $$ blocks
-- ============================================================

-- ─── 1. PROFILES ────────────────────────────────────────────
-- Core user profile table (linked to auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  district text,
  role text default 'builder' check (role in ('owner', 'admin', 'builder')),
  idea_title text,
  problem_statement text,
  threads_handle text,
  whatsapp_contact text,
  discord_tag text,
  about_yourself text,
  program_goal text,
  onboarding_completed boolean default false,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 2. COHORT CLASSES ──────────────────────────────────────
-- Sprint sessions / live classes
create table if not exists cohort_classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date,
  time text,
  status text default 'Upcoming' check (status in ('Upcoming', 'Active', 'Completed', 'Scheduled')),
  type text default 'Standard',
  description text,
  recording_url text,
  created_at timestamptz default now()
);

-- ─── 3. COHORT ATTENDANCE ───────────────────────────────────
-- Tracks which builder attended which class
create table if not exists cohort_attendance (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade,
  class_id uuid references cohort_classes(id) on delete cascade,
  status text default 'Present' check (status in ('Present', 'Absent', 'Late')),
  marked_at timestamptz default now(),
  unique(profile_id, class_id)
);

-- ─── 4. BUILDER PROGRESS (Submissions) ──────────────────────
-- Project submissions / progress updates from builders
create table if not exists builder_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  builder_name text,
  project_title text,
  project_url text,
  description text,
  screenshot_url text,
  district text,
  tags text[],
  likes int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 5. FORUM POSTS ─────────────────────────────────────────
create table if not exists forum_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  builder_name text,
  title text not null,
  body text not null,
  pinned boolean default false,
  reply_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 6. FORUM REPLIES ───────────────────────────────────────
create table if not exists forum_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references forum_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  builder_name text,
  body text not null,
  created_at timestamptz default now()
);

-- ─── 7. LIVE CLASS CHAT ─────────────────────────────────────
create table if not exists class_chat (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references cohort_classes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  builder_name text,
  message text not null,
  created_at timestamptz default now()
);

-- ─── 8. BUILDER GAME ────────────────────────────────────────
-- One row per builder — tracks their game state in Builder Studio
create table if not exists builder_game (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  vibes int default 0,                        -- Current spendable vibes
  total_vibes_earned int default 0,           -- Lifetime vibes (for leaderboard)
  level int default 1,                        -- Current level (1–10)
  xp int default 0,                           -- Total XP earned
  build_rate int default 1,                   -- Vibes earned per hour (idle)
  room_items text[] default ARRAY['desk_basic'], -- Owned shop items
  last_idle_claim timestamptz default now(),  -- Last time idle vibes were claimed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── 9. INDEXES ─────────────────────────────────────────────
-- Speed up common queries

create index if not exists idx_profiles_district on profiles(district);
create index if not exists idx_profiles_role on profiles(role);

create index if not exists idx_cohort_classes_status on cohort_classes(status);
create index if not exists idx_cohort_classes_date on cohort_classes(date);

create index if not exists idx_attendance_profile on cohort_attendance(profile_id);
create index if not exists idx_attendance_class on cohort_attendance(class_id);

create index if not exists idx_builder_progress_user on builder_progress(user_id);
create index if not exists idx_builder_progress_created on builder_progress(created_at desc);

create index if not exists idx_forum_posts_created on forum_posts(created_at desc);
create index if not exists idx_forum_posts_pinned on forum_posts(pinned desc, created_at desc);

create index if not exists idx_forum_replies_post on forum_replies(post_id);

create index if not exists idx_class_chat_class on class_chat(class_id, created_at asc);

create index if not exists idx_builder_game_user on builder_game(user_id);
create index if not exists idx_builder_game_xp on builder_game(xp desc);
create index if not exists idx_builder_game_vibes on builder_game(total_vibes_earned desc);

-- ─── 10. ROW LEVEL SECURITY ─────────────────────────────────

alter table profiles enable row level security;
alter table cohort_classes enable row level security;
alter table cohort_attendance enable row level security;
alter table builder_progress enable row level security;
alter table forum_posts enable row level security;
alter table forum_replies enable row level security;
alter table class_chat enable row level security;
alter table builder_game enable row level security;

-- ─── PROFILES POLICIES ──────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Public Read Profiles') then
    create policy "Public Read Profiles" on profiles for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Owner Update Profile') then
    create policy "Owner Update Profile" on profiles for update using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='profiles' and policyname='Owner Insert Profile') then
    create policy "Owner Insert Profile" on profiles for insert with check (auth.uid() = id);
  end if;
end $$;

-- ─── COHORT CLASSES POLICIES ────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_classes' and policyname='Public Read Classes') then
    create policy "Public Read Classes" on cohort_classes for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_classes' and policyname='Authenticated Insert Classes') then
    create policy "Authenticated Insert Classes" on cohort_classes for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_classes' and policyname='Authenticated Update Classes') then
    create policy "Authenticated Update Classes" on cohort_classes for update using (auth.role() = 'authenticated');
  end if;
end $$;

-- ─── COHORT ATTENDANCE POLICIES ─────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_attendance' and policyname='Authenticated Read Attendance') then
    create policy "Authenticated Read Attendance" on cohort_attendance for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_attendance' and policyname='Authenticated Insert Attendance') then
    create policy "Authenticated Insert Attendance" on cohort_attendance for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='cohort_attendance' and policyname='Authenticated Update Attendance') then
    create policy "Authenticated Update Attendance" on cohort_attendance for update using (auth.role() = 'authenticated');
  end if;
end $$;

-- ─── BUILDER PROGRESS POLICIES ──────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_progress' and policyname='Public Read Progress') then
    create policy "Public Read Progress" on builder_progress for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_progress' and policyname='Authenticated Insert Progress') then
    create policy "Authenticated Insert Progress" on builder_progress for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_progress' and policyname='Owner Update Progress') then
    create policy "Owner Update Progress" on builder_progress for update using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_progress' and policyname='Owner Delete Progress') then
    create policy "Owner Delete Progress" on builder_progress for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─── FORUM POSTS POLICIES ───────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_posts' and policyname='Public Read Posts') then
    create policy "Public Read Posts" on forum_posts for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_posts' and policyname='Authenticated Insert Posts') then
    create policy "Authenticated Insert Posts" on forum_posts for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_posts' and policyname='Owner Update Posts') then
    create policy "Owner Update Posts" on forum_posts for update using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_posts' and policyname='Owner Delete Posts') then
    create policy "Owner Delete Posts" on forum_posts for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─── FORUM REPLIES POLICIES ─────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_replies' and policyname='Public Read Replies') then
    create policy "Public Read Replies" on forum_replies for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_replies' and policyname='Authenticated Insert Replies') then
    create policy "Authenticated Insert Replies" on forum_replies for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='forum_replies' and policyname='Owner Delete Replies') then
    create policy "Owner Delete Replies" on forum_replies for delete using (auth.uid() = user_id);
  end if;
end $$;

-- ─── CLASS CHAT POLICIES ────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='class_chat' and policyname='Authenticated Read Chat') then
    create policy "Authenticated Read Chat" on class_chat for select using (auth.role() = 'authenticated');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='class_chat' and policyname='Authenticated Insert Chat') then
    create policy "Authenticated Insert Chat" on class_chat for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ─── BUILDER GAME POLICIES ──────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_game' and policyname='Public Read Game') then
    create policy "Public Read Game" on builder_game for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_game' and policyname='Owner Update Game') then
    create policy "Owner Update Game" on builder_game for update using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='builder_game' and policyname='Authenticated Insert Game') then
    create policy "Authenticated Insert Game" on builder_game for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- ─── 11. REALTIME ───────────────────────────────────────────
-- Enable realtime for live features (class chat, attendance, game, resources)
-- Run these in Supabase Dashboard → Database → Replication
-- Or uncomment and run here:

-- alter publication supabase_realtime add table class_chat;
-- alter publication supabase_realtime add table cohort_attendance;
-- alter publication supabase_realtime add table cohort_classes;
-- alter publication supabase_realtime add table builder_game;
-- alter publication supabase_realtime add table forum_posts;
-- alter publication supabase_realtime add table forum_replies;
-- alter publication supabase_realtime add table resources;

-- ─── 12. HELPER FUNCTION: Auto-update updated_at ────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to tables with updated_at
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_profiles_updated_at') then
    create trigger set_profiles_updated_at
      before update on profiles
      for each row execute function update_updated_at_column();
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_builder_progress_updated_at') then
    create trigger set_builder_progress_updated_at
      before update on builder_progress
      for each row execute function update_updated_at_column();
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_builder_game_updated_at') then
    create trigger set_builder_game_updated_at
      before update on builder_game
      for each row execute function update_updated_at_column();
  end if;
end $$;

-- ─── 13. RESOURCES ──────────────────────────────────────────
-- Educational resources for builders (tutorials, guides, tools)
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  url text not null,
  category text default 'tutorial' check (category in ('tutorial', 'guide', 'code', 'tool')),
  difficulty text default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration text,
  thumbnail text,
  tags text[],
  author text,
  published_at timestamptz default now(),
  views int default 0,
  rating numeric default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS for resources table
alter table resources enable row level security;

-- ─── RESOURCES POLICIES ─────────────────────────────────────
-- Public can read all resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Public Read Resources') then
    create policy "Public Read Resources" on resources for select using (true);
  end if;
end $$;

-- Only authenticated users can insert resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Authenticated Insert Resources') then
    create policy "Authenticated Insert Resources" on resources for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Only authenticated users can update resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Authenticated Update Resources') then
    create policy "Authenticated Update Resources" on resources for update using (auth.role() = 'authenticated');
  end if;
end $$;

-- ─── 14. STUDIO LIKES ───────────────────────────────────────
-- Builders can like each other's studios (one like per builder per studio)
create table if not exists studio_likes (
  id uuid default gen_random_uuid() primary key,
  target_user_id uuid not null references profiles(id) on delete cascade,
  liker_user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(target_user_id, liker_user_id)
);

create index if not exists idx_studio_likes_target on studio_likes(target_user_id);
create index if not exists idx_studio_likes_liker on studio_likes(liker_user_id);

alter table studio_likes enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='studio_likes' and policyname='Public Read Studio Likes') then
    create policy "Public Read Studio Likes" on studio_likes for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='studio_likes' and policyname='Authenticated Insert Studio Like') then
    create policy "Authenticated Insert Studio Like" on studio_likes for insert with check (auth.uid() = liker_user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='studio_likes' and policyname='Owner Delete Studio Like') then
    create policy "Owner Delete Studio Like" on studio_likes for delete using (auth.uid() = liker_user_id);
  end if;
end $$;

-- ─── DONE ───────────────────────────────────────────────────
-- All tables, indexes, RLS policies, and triggers are set up.
-- The builder_game table is the key one needed for Builder Studio.
