-- Hall of Fame curated graduate entries
create table if not exists public.hall_of_fame_entries (
  id uuid primary key default gen_random_uuid(),
  builder_id uuid not null references auth.users(id) on delete cascade,
  certificate_id uuid not null references public.builder_certificates(id) on delete cascade,
  featured_project_url text,
  featured_quote text,
  featured_order int not null default 1000,
  is_active boolean not null default true,
  featured_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (builder_id),
  unique (certificate_id)
);

create index if not exists idx_hof_active_ordered
  on public.hall_of_fame_entries (is_active, featured_order, featured_at desc);

create index if not exists idx_hof_builder_id
  on public.hall_of_fame_entries (builder_id);

create index if not exists idx_hof_certificate_id
  on public.hall_of_fame_entries (certificate_id);

create or replace function public.set_hall_of_fame_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_hall_of_fame_updated_at on public.hall_of_fame_entries;
create trigger trg_hall_of_fame_updated_at
before update on public.hall_of_fame_entries
for each row execute function public.set_hall_of_fame_updated_at();

alter table public.hall_of_fame_entries enable row level security;

drop policy if exists "hall_of_fame_public_read_active" on public.hall_of_fame_entries;
create policy "hall_of_fame_public_read_active"
on public.hall_of_fame_entries
for select
using (is_active = true);

drop policy if exists "hall_of_fame_admin_insert" on public.hall_of_fame_entries;
create policy "hall_of_fame_admin_insert"
on public.hall_of_fame_entries
for insert
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('owner', 'admin')
  )
);

drop policy if exists "hall_of_fame_admin_update" on public.hall_of_fame_entries;
create policy "hall_of_fame_admin_update"
on public.hall_of_fame_entries
for update
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('owner', 'admin')
  )
);

drop policy if exists "hall_of_fame_admin_delete" on public.hall_of_fame_entries;
create policy "hall_of_fame_admin_delete"
on public.hall_of_fame_entries
for delete
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and lower(coalesce(p.role, '')) in ('owner', 'admin')
  )
);
