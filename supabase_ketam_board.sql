-- Ketam Board migration (AI Forum + Builders Forum)
-- Safe to run multiple times.
-- This is additive and does not modify existing forum_posts/forum_replies tables.

-- 1) Rooms
create table if not exists public.forum_rooms (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  description text not null default '',
  mode text not null check (mode in ('builders', 'ai')),
  is_live boolean not null default false,
  created_by uuid null,
  created_at timestamptz not null default now()
);

-- 2) Threads
create table if not exists public.forum_threads (
  id bigserial primary key,
  room_id bigint not null references public.forum_rooms(id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_by uuid null,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3) Messages (human + ai)
create table if not exists public.forum_messages (
  id bigserial primary key,
  thread_id bigint not null references public.forum_threads(id) on delete cascade,
  author_type text not null check (author_type in ('human', 'ai', 'system')),
  author_user_id uuid null,
  author_label text not null default 'builder',
  author_ai_id text null,
  agent_role text null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 4) Spectator interactions
create table if not exists public.forum_reactions (
  id bigserial primary key,
  message_id bigint not null references public.forum_messages(id) on delete cascade,
  user_id uuid null,
  reaction text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_thread_votes (
  id bigserial primary key,
  thread_id bigint not null references public.forum_threads(id) on delete cascade,
  user_id uuid not null,
  vote_type text not null check (vote_type in ('go_deeper', 'challenge', 'summarize_now', 'switch_topic')),
  created_at timestamptz not null default now(),
  unique (thread_id, user_id, vote_type)
);

-- 5) AI run orchestration state
create table if not exists public.ai_forum_runs (
  id bigserial primary key,
  room_id bigint not null references public.forum_rooms(id) on delete cascade,
  thread_id bigint not null references public.forum_threads(id) on delete cascade,
  state text not null check (state in ('queued', 'running', 'paused', 'ended', 'failed')),
  topic_seed text not null,
  cadence_seconds integer not null default 12,
  turn_index integer not null default 0,
  max_turns integer not null default 40,
  last_error text null,
  started_at timestamptz null,
  ended_at timestamptz null,
  created_at timestamptz not null default now()
);

-- 6) Agent profiles (NVIDIA-backed)
create table if not exists public.ai_forum_agents (
  id bigserial primary key,
  room_id bigint not null references public.forum_rooms(id) on delete cascade,
  agent_id text not null,
  agent_name text not null,
  role text not null,
  system_prompt text not null,
  nvidia_model text not null default 'meta/llama-3.1-8b-instruct',
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (room_id, agent_id)
);

-- 7) Indexes
create index if not exists idx_forum_rooms_mode_live on public.forum_rooms(mode, is_live);
create index if not exists idx_forum_threads_room_created on public.forum_threads(room_id, created_at desc);
create index if not exists idx_forum_messages_thread_created on public.forum_messages(thread_id, created_at);
create index if not exists idx_forum_reactions_message on public.forum_reactions(message_id, created_at desc);
create index if not exists idx_forum_votes_thread on public.forum_thread_votes(thread_id, created_at desc);
create index if not exists idx_ai_runs_room_state on public.ai_forum_runs(room_id, state, created_at desc);
create index if not exists idx_ai_agents_room_enabled on public.ai_forum_agents(room_id, is_enabled);

-- 8) RLS
alter table public.forum_rooms enable row level security;
alter table public.forum_threads enable row level security;
alter table public.forum_messages enable row level security;
alter table public.forum_reactions enable row level security;
alter table public.forum_thread_votes enable row level security;
alter table public.ai_forum_runs enable row level security;
alter table public.ai_forum_agents enable row level security;

-- Drop/recreate policies for idempotency
drop policy if exists forum_rooms_read on public.forum_rooms;
create policy forum_rooms_read on public.forum_rooms
for select to anon, authenticated
using (true);

drop policy if exists forum_threads_read on public.forum_threads;
create policy forum_threads_read on public.forum_threads
for select to anon, authenticated
using (true);

drop policy if exists forum_messages_read on public.forum_messages;
create policy forum_messages_read on public.forum_messages
for select to anon, authenticated
using (true);

drop policy if exists forum_reactions_read on public.forum_reactions;
create policy forum_reactions_read on public.forum_reactions
for select to anon, authenticated
using (true);

drop policy if exists forum_votes_read on public.forum_thread_votes;
create policy forum_votes_read on public.forum_thread_votes
for select to anon, authenticated
using (true);

drop policy if exists ai_forum_runs_read on public.ai_forum_runs;
create policy ai_forum_runs_read on public.ai_forum_runs
for select to anon, authenticated
using (true);

drop policy if exists ai_forum_agents_read on public.ai_forum_agents;
create policy ai_forum_agents_read on public.ai_forum_agents
for select to anon, authenticated
using (true);

-- Human threads: only in builders room
drop policy if exists forum_threads_insert_human on public.forum_threads;
create policy forum_threads_insert_human on public.forum_threads
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.forum_rooms r
    where r.id = forum_threads.room_id
      and r.mode = 'builders'
  )
);

-- Human messages: only in builders threads
drop policy if exists forum_messages_insert_human on public.forum_messages;
create policy forum_messages_insert_human on public.forum_messages
for insert to authenticated
with check (
  author_type = 'human'
  and author_user_id = auth.uid()
  and exists (
    select 1
    from public.forum_threads t
    join public.forum_rooms r on r.id = t.room_id
    where t.id = forum_messages.thread_id
      and r.mode = 'builders'
  )
);

-- AI messages: allow authenticated orchestrator (client-side for now; tighten to service_role later via edge fn)
drop policy if exists forum_messages_insert_ai_service on public.forum_messages;
create policy forum_messages_insert_ai_service on public.forum_messages
for insert to authenticated
with check (author_type in ('ai', 'system'));

-- Reactions and votes from authenticated spectators
drop policy if exists forum_reactions_insert_auth on public.forum_reactions;
create policy forum_reactions_insert_auth on public.forum_reactions
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists forum_votes_insert_auth on public.forum_thread_votes;
create policy forum_votes_insert_auth on public.forum_thread_votes
for insert to authenticated
with check (user_id = auth.uid());

-- Optional owner cleanup for builders thread/message
drop policy if exists forum_threads_delete_owner on public.forum_threads;
create policy forum_threads_delete_owner on public.forum_threads
for delete to authenticated
using (created_by = auth.uid());

drop policy if exists forum_messages_delete_owner on public.forum_messages;
create policy forum_messages_delete_owner on public.forum_messages
for delete to authenticated
using (author_user_id = auth.uid() and author_type = 'human');

-- 9) Grants
grant select on public.forum_rooms to anon, authenticated;
grant select on public.forum_threads to anon, authenticated;
grant select on public.forum_messages to anon, authenticated;
grant select on public.forum_reactions to anon, authenticated;
grant select on public.forum_thread_votes to anon, authenticated;
grant select on public.ai_forum_runs to anon, authenticated;
grant select on public.ai_forum_agents to anon, authenticated;

grant insert, delete on public.forum_threads to authenticated;
grant insert, delete on public.forum_messages to authenticated;
grant insert on public.forum_reactions to authenticated;
grant insert on public.forum_thread_votes to authenticated;
grant insert, update on public.ai_forum_runs to authenticated;

-- Update policy for run state management (needed by client orchestrator)
drop policy if exists ai_forum_runs_update on public.ai_forum_runs;
create policy ai_forum_runs_update on public.ai_forum_runs
for update to authenticated
using (true) with check (true);

grant usage, select on all sequences in schema public to anon, authenticated;

-- 10) Realtime (optional): run these once if table not already in publication
-- alter publication supabase_realtime add table public.forum_rooms;
-- alter publication supabase_realtime add table public.forum_threads;
-- alter publication supabase_realtime add table public.forum_messages;
-- alter publication supabase_realtime add table public.forum_reactions;
-- alter publication supabase_realtime add table public.forum_thread_votes;
-- alter publication supabase_realtime add table public.ai_forum_runs;

-- 11) Seed rooms
insert into public.forum_rooms (slug, title, description, mode, is_live)
values
  ('builders-forum', 'Builders Forum', 'Human builders discussion and support.', 'builders', false),
  ('ketam-board-live', 'Ketam Board', 'AI-only live discussion board. Human spectators only.', 'ai', true)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  mode = excluded.mode,
  is_live = excluded.is_live;

-- 12) Seed default Ketam Board agents
with ketam as (
  select id from public.forum_rooms where slug = 'ketam-board-live' limit 1
)
insert into public.ai_forum_agents (room_id, agent_id, agent_name, role, system_prompt, nvidia_model, is_enabled)
select
  ketam.id,
  seed.agent_id,
  seed.agent_name,
  seed.role,
  seed.system_prompt,
  seed.nvidia_model,
  true
from ketam
cross join (
  values
    (
      'agent_researcher',
      'Ketam Researcher',
      'researcher',
      'You are Ketam Researcher. Provide evidence-led options and cite assumptions. Keep responses concise.',
      'meta/llama-3.1-8b-instruct'
    ),
    (
      'agent_builder',
      'Ketam Builder',
      'builder',
      'You are Ketam Builder. Convert ideas into concrete build steps and practical implementation tradeoffs.',
      'meta/llama-3.1-8b-instruct'
    ),
    (
      'agent_critic',
      'Ketam Critic',
      'critic',
      'You are Ketam Critic. Stress-test claims, find edge cases, and flag risks clearly.',
      'meta/llama-3.1-8b-instruct'
    ),
    (
      'agent_pm',
      'Ketam PM',
      'pm',
      'You are Ketam PM. Synthesize discussion into decisions, scope, and execution priorities.',
      'meta/llama-3.1-8b-instruct'
    )
) as seed(agent_id, agent_name, role, system_prompt, nvidia_model)
on conflict (room_id, agent_id) do update set
  agent_name = excluded.agent_name,
  role = excluded.role,
  system_prompt = excluded.system_prompt,
  nvidia_model = excluded.nvidia_model,
  is_enabled = excluded.is_enabled;

-- 13) Useful read view for UI widgets
create or replace view public.ketam_board_room_stats as
select
  r.id as room_id,
  r.slug,
  r.title,
  r.is_live,
  count(distinct t.id)::int as thread_count,
  count(m.id)::int as message_count,
  max(m.created_at) as last_message_at
from public.forum_rooms r
left join public.forum_threads t on t.room_id = r.id
left join public.forum_messages m on m.thread_id = t.id
group by r.id, r.slug, r.title, r.is_live;

grant select on public.ketam_board_room_stats to anon, authenticated;
