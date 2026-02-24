-- ============================================================
-- VibeSelangor: Idea Submitted vs Project Submitted Split
-- Run in Supabase SQL Editor (safe/idempotent)
-- ============================================================

-- 1) Core tables
create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  problem_statement text,
  status text not null default 'submitted'
    check (status in ('draft', 'submitted', 'archived')),
  source text not null default 'manual',
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid references public.ideas(id) on delete set null,
  title text not null,
  one_liner text,
  final_url text,
  repo_url text,
  demo_url text,
  district text,
  source_progress_id uuid,
  status text not null default 'submitted'
    check (status in ('draft', 'in_progress', 'submitted', 'verified')),
  submitted_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists idx_ideas_user_title_unique
  on public.ideas(user_id, lower(title));

create index if not exists idx_ideas_user_status_submitted_at
  on public.ideas(user_id, status, submitted_at desc);

create unique index if not exists idx_projects_source_progress_unique
  on public.projects(source_progress_id)
  where source_progress_id is not null;

create index if not exists idx_projects_user_status_submitted_at
  on public.projects(user_id, status, submitted_at desc);

-- 2) Updated-at trigger helper
create or replace function public.vs_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_ideas_updated_at') then
    create trigger trg_ideas_updated_at
      before update on public.ideas
      for each row execute function public.vs_set_updated_at();
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_projects_updated_at') then
    create trigger trg_projects_updated_at
      before update on public.projects
      for each row execute function public.vs_set_updated_at();
  end if;
end $$;

-- 3) Backfill ideas from profiles.idea_title
insert into public.ideas (user_id, title, problem_statement, status, source, submitted_at)
select
  p.id as user_id,
  trim(p.idea_title) as title,
  nullif(trim(p.problem_statement), '') as problem_statement,
  'submitted' as status,
  'profiles_backfill' as source,
  coalesce(p.updated_at, p.created_at, now()) as submitted_at
from public.profiles p
where coalesce(trim(p.idea_title), '') <> ''
  and not exists (
    select 1
    from public.ideas i
    where i.user_id = p.id
      and lower(i.title) = lower(trim(p.idea_title))
  );

-- 4) Backfill projects from builder_progress
-- Handles both project_url and submission_url schemas.
insert into public.projects (
  user_id,
  idea_id,
  title,
  one_liner,
  final_url,
  repo_url,
  demo_url,
  district,
  source_progress_id,
  status,
  submitted_at,
  created_at
)
select
  bp.user_id,
  (
    select i.id
    from public.ideas i
    where i.user_id = bp.user_id
    order by i.submitted_at desc nulls last, i.created_at desc
    limit 1
  ) as idea_id,
  coalesce(nullif(trim(bp.project_name), ''), nullif(trim(bp.project_title), ''), 'Untitled Project') as title,
  nullif(trim(coalesce(bp.one_liner, bp.description)), '') as one_liner,
  nullif(trim(coalesce(bp.submission_url, bp.project_url, bp.demo_url, bp.github_url)), '') as final_url,
  nullif(trim(bp.github_url), '') as repo_url,
  nullif(trim(bp.demo_url), '') as demo_url,
  bp.district,
  bp.id as source_progress_id,
  case
    when coalesce(trim(bp.submission_url), trim(bp.project_url), trim(bp.demo_url), trim(bp.github_url), '') <> ''
      then 'submitted'
    else 'in_progress'
  end as status,
  coalesce(bp.updated_at, bp.created_at, now()) as submitted_at,
  coalesce(bp.created_at, now()) as created_at
from public.builder_progress bp
where not exists (
  select 1 from public.projects p where p.source_progress_id = bp.id
);

-- 5) Views for metrics + compatibility
create or replace view public.vs_metrics_overview as
select
  (
    select count(*)
    from public.profiles p
    where coalesce(lower(p.role), 'builder') not in ('owner', 'admin')
  )::int as builders_count,
  (
    select count(*)
    from public.ideas i
    where i.status = 'submitted'
  )::int as ideas_submitted_count,
  (
    select count(*)
    from public.projects p
    where p.status in ('submitted', 'verified')
      and coalesce(trim(p.final_url), '') <> ''
  )::int as projects_submitted_count;

create or replace view public.vs_builder_pipeline as
select
  p.id as profile_id,
  p.full_name,
  p.district,
  i.id as idea_id,
  i.title as idea_title,
  i.status as idea_status,
  pr.id as project_id,
  pr.title as project_title,
  pr.status as project_status,
  pr.final_url,
  pr.submitted_at as project_submitted_at
from public.profiles p
left join lateral (
  select i1.*
  from public.ideas i1
  where i1.user_id = p.id
  order by i1.submitted_at desc nulls last, i1.created_at desc
  limit 1
) i on true
left join lateral (
  select pr1.*
  from public.projects pr1
  where pr1.user_id = p.id
  order by pr1.submitted_at desc nulls last, pr1.created_at desc
  limit 1
) pr on true;

-- 6) RLS
alter table public.ideas enable row level security;
alter table public.projects enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'ideas' and policyname = 'Public read submitted ideas'
  ) then
    create policy "Public read submitted ideas"
      on public.ideas for select
      using (status = 'submitted');
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'ideas' and policyname = 'Owner manage own ideas'
  ) then
    create policy "Owner manage own ideas"
      on public.ideas for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'projects' and policyname = 'Public read submitted projects'
  ) then
    create policy "Public read submitted projects"
      on public.projects for select
      using (status in ('submitted', 'verified'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'projects' and policyname = 'Owner manage own projects'
  ) then
    create policy "Owner manage own projects"
      on public.projects for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

-- 7) Quick verification output
select * from public.vs_metrics_overview;

