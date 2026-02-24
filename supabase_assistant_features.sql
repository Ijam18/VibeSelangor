-- Assistant memory + scraping + traces
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.assistant_memory_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text,
  memory_type text not null default 'long' check (memory_type in ('today', 'long')),
  content text not null,
  importance_score int not null default 0,
  source text not null default 'assistant',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_memory_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text,
  event_type text not null check (event_type in ('retrieve', 'capture', 'write', 'prune')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed', 'cancelled')),
  mode text not null default 'single' check (mode in ('single', 'crawl')),
  urls text[] not null,
  max_pages int not null default 1,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.scrape_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.scrape_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  text_content text,
  extracted jsonb not null default '{}'::jsonb,
  word_count int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.assistant_traces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text,
  request_message text not null,
  response_message text,
  used_memory boolean not null default false,
  used_scrape boolean not null default false,
  model text,
  memory_ms int,
  scrape_ms int,
  llm_ms int,
  total_ms int,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_mem_entries_user_created on public.assistant_memory_entries(user_id, created_at desc);
create index if not exists idx_mem_events_user_created on public.assistant_memory_events(user_id, created_at desc);
create index if not exists idx_scrape_jobs_user_created on public.scrape_jobs(user_id, created_at desc);
create index if not exists idx_scrape_results_job on public.scrape_results(job_id);
create index if not exists idx_traces_user_created on public.assistant_traces(user_id, created_at desc);

alter table public.assistant_memory_entries enable row level security;
alter table public.assistant_memory_events enable row level security;
alter table public.scrape_jobs enable row level security;
alter table public.scrape_results enable row level security;
alter table public.assistant_traces enable row level security;

drop policy if exists assistant_memory_entries_select on public.assistant_memory_entries;
create policy assistant_memory_entries_select on public.assistant_memory_entries
for select to authenticated using (auth.uid() = user_id);

drop policy if exists assistant_memory_entries_insert on public.assistant_memory_entries;
create policy assistant_memory_entries_insert on public.assistant_memory_entries
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists assistant_memory_events_select on public.assistant_memory_events;
create policy assistant_memory_events_select on public.assistant_memory_events
for select to authenticated using (auth.uid() = user_id);

drop policy if exists assistant_memory_events_insert on public.assistant_memory_events;
create policy assistant_memory_events_insert on public.assistant_memory_events
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists scrape_jobs_select on public.scrape_jobs;
create policy scrape_jobs_select on public.scrape_jobs
for select to authenticated using (auth.uid() = user_id);

drop policy if exists scrape_jobs_insert on public.scrape_jobs;
create policy scrape_jobs_insert on public.scrape_jobs
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists scrape_results_select on public.scrape_results;
create policy scrape_results_select on public.scrape_results
for select to authenticated using (auth.uid() = user_id);

drop policy if exists assistant_traces_select on public.assistant_traces;
create policy assistant_traces_select on public.assistant_traces
for select to authenticated using (auth.uid() = user_id);
