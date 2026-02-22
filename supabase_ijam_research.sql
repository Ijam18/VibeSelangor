-- IJAM_BOT research telemetry schema
-- Run this in Supabase SQL editor.

create table if not exists public.ijam_research_events (
  id bigserial primary key,
  event_type text not null,
  runtime_mode text not null default 'offline',
  page text not null default 'landing',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ijam_research_events_created_at
  on public.ijam_research_events (created_at desc);

create index if not exists idx_ijam_research_events_type
  on public.ijam_research_events (event_type);

alter table public.ijam_research_events enable row level security;

create table if not exists public.ijam_consciousness_snapshots (
  id bigserial primary key,
  runtime_mode text not null default 'offline',
  source text not null default 'landing',
  readiness int not null default 0,
  prompt_text text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ijam_consciousness_snapshots_created_at
  on public.ijam_consciousness_snapshots (created_at desc);

alter table public.ijam_consciousness_snapshots enable row level security;

-- Public insert/select for browser telemetry (adjust if you want stricter auth).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ijam_research_events'
      and policyname = 'ijam_research_events_insert_public'
  ) then
    create policy ijam_research_events_insert_public
      on public.ijam_research_events
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ijam_research_events'
      and policyname = 'ijam_research_events_select_public'
  ) then
    create policy ijam_research_events_select_public
      on public.ijam_research_events
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ijam_consciousness_snapshots'
      and policyname = 'ijam_consciousness_snapshots_insert_public'
  ) then
    create policy ijam_consciousness_snapshots_insert_public
      on public.ijam_consciousness_snapshots
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'ijam_consciousness_snapshots'
      and policyname = 'ijam_consciousness_snapshots_select_public'
  ) then
    create policy ijam_consciousness_snapshots_select_public
      on public.ijam_consciousness_snapshots
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;

create or replace view public.website_analytics_summary as
select
  count(*) filter (where event_type = 'page_view')::int as page_views,
  count(*)::int as total_events,
  count(*) filter (where event_type = 'chat_user_message')::int as chat_messages,
  count(*) filter (where event_type = 'chat_ai_response')::int as ai_calls,
  count(*) filter (where event_type = 'chat_local_response')::int as local_responses,
  count(*) filter (
    where event_type in ('segmented_intent_router', 'segmented_knowledge_base')
  )::int as segmented_calls,
  (
    count(*) filter (where event_type = 'chat_local_response') * 350
    + count(*) filter (
      where event_type in ('segmented_intent_router', 'segmented_knowledge_base')
    ) * 180
  )::int as token_saved_estimate,
  (
    select count(*)::int
    from public.ijam_consciousness_snapshots s
    where s.created_at >= now() - interval '30 days'
  ) as consciousness_uploads
from public.ijam_research_events
where created_at >= now() - interval '30 days';

grant select on public.website_analytics_summary to anon, authenticated;
grant insert, select on public.ijam_consciousness_snapshots to anon, authenticated;
