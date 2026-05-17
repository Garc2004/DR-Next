-- Row Level Security and helper functions

-- ────────────────────────────────────────────────────────────────────────────
-- Helpers
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.is_leader()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'leader'
      and deleted_at is null
  );
$$;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
set search_path = public
as $$
  select auth.uid();
$$;

-- ────────────────────────────────────────────────────────────────────────────
-- Enable RLS
-- ────────────────────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.resources         enable row level security;
alter table public.production_orders enable row level security;
alter table public.production_runs   enable row level security;
alter table public.operators         enable row level security;
alter table public.attendances       enable row level security;
alter table public.audit_logs        enable row level security;

-- ────────────────────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────────────────────
create policy "profiles: authenticated read non-deleted"
  on public.profiles for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "profiles: self update display_name and avatar"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles: leader full"
  on public.profiles for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- resources
-- ────────────────────────────────────────────────────────────────────────────
create policy "resources: authenticated read active"
  on public.resources for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "resources: leader manage"
  on public.resources for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- production_orders
-- ────────────────────────────────────────────────────────────────────────────
create policy "orders: authenticated read"
  on public.production_orders for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "orders: authenticated insert"
  on public.production_orders for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "orders: leader manage"
  on public.production_orders for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- production_runs
-- ────────────────────────────────────────────────────────────────────────────
create policy "runs: authenticated read"
  on public.production_runs for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "runs: authenticated insert"
  on public.production_runs for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "runs: authenticated update own or self lifecycle"
  on public.production_runs for update
  to authenticated
  using (
    deleted_at is null
    and (
      created_by = auth.uid()
      or started_by = auth.uid()
      or finished_by = auth.uid()
      or public.is_leader()
    )
  )
  with check (
    deleted_at is null
    or public.is_leader()
  );

create policy "runs: leader hard delete"
  on public.production_runs for delete
  to authenticated
  using (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- operators
-- ────────────────────────────────────────────────────────────────────────────
create policy "operators: authenticated read"
  on public.operators for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "operators: leader manage"
  on public.operators for all
  to authenticated
  using (public.is_leader())
  with check (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- attendances
-- ────────────────────────────────────────────────────────────────────────────
create policy "attendances: authenticated read"
  on public.attendances for select
  to authenticated
  using (deleted_at is null or public.is_leader());

create policy "attendances: authenticated insert"
  on public.attendances for insert
  to authenticated
  with check (recorded_by = auth.uid());

create policy "attendances: authenticated update own record"
  on public.attendances for update
  to authenticated
  using (recorded_by = auth.uid() or public.is_leader())
  with check (recorded_by = auth.uid() or public.is_leader());

create policy "attendances: leader delete"
  on public.attendances for delete
  to authenticated
  using (public.is_leader());

-- ────────────────────────────────────────────────────────────────────────────
-- audit_logs (read-only for leaders)
-- ────────────────────────────────────────────────────────────────────────────
create policy "audit: leader read"
  on public.audit_logs for select
  to authenticated
  using (public.is_leader());

-- No insert/update/delete policy → only triggers (SECURITY DEFINER) can write.

-- ────────────────────────────────────────────────────────────────────────────
-- Grants
-- ────────────────────────────────────────────────────────────────────────────
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
