-- Apple-style iPad widget analytics for LandingPage terminal
-- Run in Supabase SQL editor.

create table if not exists public.web_analytics_events (
  id bigserial primary key,
  event_type text not null default 'page_view',
  session_id text not null,
  source text not null default 'direct',
  device_type text not null default 'desktop',
  os_name text not null default 'other',
  country_guess text not null default 'UN',
  path text not null default '/',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_web_analytics_events_created_at
  on public.web_analytics_events (created_at desc);

create index if not exists idx_web_analytics_events_session
  on public.web_analytics_events (session_id);

alter table public.web_analytics_events enable row level security;

drop policy if exists web_analytics_events_insert_public on public.web_analytics_events;
create policy web_analytics_events_insert_public
  on public.web_analytics_events
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists web_analytics_events_select_public on public.web_analytics_events;
create policy web_analytics_events_select_public
  on public.web_analytics_events
  for select
  to anon, authenticated
  using (true);

create or replace view public.website_analytics_widgets as
with recent as (
  select *
  from public.web_analytics_events
  where created_at >= now() - interval '30 days'
),
sessions as (
  select
    session_id,
    count(*) as events_in_session
  from recent
  group by session_id
),
bounce as (
  select
    case
      when count(*) = 0 then 0
      else round((count(*) filter (where events_in_session = 1)::numeric / count(*)::numeric) * 100, 1)
    end as bounce_rate
  from sessions
),
top_country as (
  select country_guess
  from recent
  group by country_guess
  order by count(*) desc
  limit 1
),
device_mix as (
  select string_agg(device_type || ':' || pct || '%', ' | ' order by cnt desc) as mix
  from (
    select
      device_type,
      count(*) as cnt,
      round((count(*)::numeric / nullif((select count(*) from recent), 0)::numeric) * 100, 1) as pct
    from recent
    group by device_type
  ) d
),
os_mix as (
  select string_agg(os_name || ':' || pct || '%', ' | ' order by cnt desc) as mix
  from (
    select
      os_name,
      count(*) as cnt,
      round((count(*)::numeric / nullif((select count(*) from recent), 0)::numeric) * 100, 1) as pct
    from recent
    group by os_name
  ) o
),
top_source as (
  select source
  from recent
  group by source
  order by count(*) desc
  limit 1
)
select
  (select count(*) from sessions)::int as visitors,
  (select count(*) from recent)::int as page_views,
  coalesce((select bounce_rate from bounce), 0)::numeric as bounce_rate,
  coalesce((select country_guess from top_country), '--')::text as top_country,
  coalesce((select mix from device_mix), '--')::text as device_mix,
  coalesce((select mix from os_mix), '--')::text as os_mix,
  coalesce((select source from top_source), '--')::text as top_source;

grant insert, select on public.web_analytics_events to anon, authenticated;
grant select on public.website_analytics_widgets to anon, authenticated;
