-- ============================================================================
-- DR-Next: schema consolidado para aplicar en el SQL Editor del Dashboard
-- Proyecto: jqxrsnnhmemqjgqypcre
-- 
-- Pega TODO este archivo en https://supabase.com/dashboard/project/jqxrsnnhmemqjgqypcre/sql/new
-- y dale Run. Tarda ~10 segundos.
-- 
-- Idempotente parcial: NO re-correr sin antes hacer 'drop schema public cascade; create schema public;'
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000000_extensions.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Extensions required by the DR-Next schema
create extension if not exists "pg_trgm" with schema extensions;
create extension if not exists "btree_gist" with schema extensions;
create extension if not exists "citext" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000010_enums.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Domain enums (PostgreSQL native types)

create type public.user_role as enum ('leader', 'operator');

create type public.production_status as enum ('pending', 'active', 'completed', 'cancelled');

create type public.attendance_status as enum (
  'present',
  'other_sector',
  'medical_leave',
  'absent',
  'holiday'
);

create type public.resource_kind as enum ('reactor', 'filler', 'mixer', 'other');

create type public.audit_entity as enum (
  'production_order',
  'production_run',
  'attendance',
  'operator',
  'resource',
  'profile'
);

create type public.audit_action as enum (
  'create',
  'update',
  'delete',
  'start',
  'finish',
  'cancel'
);


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000020_tables.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Core tables for DR-Next
-- Convention: snake_case, UUID PKs (except audit_logs), timestamptz, soft-delete via deleted_at.

-- ────────────────────────────────────────────────────────────────────────────
-- profiles (1:1 con auth.users)
-- ────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      citext not null unique,
  display_name  text not null check (length(display_name) between 2 and 80),
  role          public.user_role not null default 'operator',
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

comment on table public.profiles is
  'Application profile linked 1:1 to auth.users. role is mirrored to JWT app_metadata via custom_access_token_hook.';

-- ────────────────────────────────────────────────────────────────────────────
-- resources (reatores / máquinas, antes hardcoded RESOURCES en cliente)
-- ────────────────────────────────────────────────────────────────────────────
create table public.resources (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (length(code) between 2 and 64),
  label       text not null check (length(label) between 2 and 80),
  kind        public.resource_kind not null default 'reactor',
  position    int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table public.resources is
  'Production resources (reactors, fillers, mixers). Replaces the original client-side constant.';

-- ────────────────────────────────────────────────────────────────────────────
-- production_orders (cabecera: ordem + lote)
-- ────────────────────────────────────────────────────────────────────────────
create table public.production_orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  bigint not null,
  batch_number  bigint not null,
  product_name  text,
  notes         text,
  created_by    uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique (order_number, batch_number)
);

comment on table public.production_orders is
  'Order header (ordem + lote). One order may have many runs across resources.';

-- ────────────────────────────────────────────────────────────────────────────
-- production_runs (execução por lote em um recurso)
-- replaces original production_records
-- ────────────────────────────────────────────────────────────────────────────
create table public.production_runs (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.production_orders (id) on delete restrict,
  resource_id     uuid not null references public.resources (id) on delete restrict,
  status          public.production_status not null default 'pending',
  units_produced  numeric(12, 3) not null default 0 check (units_produced >= 0),
  started_at      timestamptz,
  ended_at        timestamptz,
  started_by      uuid references public.profiles (id) on delete set null,
  finished_by     uuid references public.profiles (id) on delete set null,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,

  -- Invariants
  check (ended_at is null or started_at is not null),
  check (ended_at is null or ended_at >= started_at),
  check (
    (status = 'active' and started_at is not null and ended_at is null)
    or (status = 'completed' and started_at is not null and ended_at is not null)
    or status in ('pending', 'cancelled')
  ),

  -- Evita 2 runs activos en el mismo recurso (resuelve conflictResourceId en DB)
  exclude using gist (
    resource_id with =,
    tstzrange(
      coalesce(started_at, '-infinity'::timestamptz),
      coalesce(ended_at, 'infinity'::timestamptz),
      '[)'
    ) with &&
  ) where (status = 'active' and deleted_at is null)
);

comment on table public.production_runs is
  'Per-resource execution of a production order. EXCLUDE constraint guarantees no overlapping active runs on the same resource.';

-- ────────────────────────────────────────────────────────────────────────────
-- operators (factory floor talent; no auth)
-- ────────────────────────────────────────────────────────────────────────────
create table public.operators (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (length(full_name) between 2 and 120),
  job_title   text not null check (length(job_title) between 2 and 80),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

comment on table public.operators is
  'Production line operators. Independent from auth.users (no login).';

-- ────────────────────────────────────────────────────────────────────────────
-- attendances (1 row per operator + date)
-- ────────────────────────────────────────────────────────────────────────────
create table public.attendances (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references public.operators (id) on delete cascade,
  attended_on  date not null,
  status       public.attendance_status not null,
  note         text,
  recorded_by  uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (operator_id, attended_on)
);

comment on table public.attendances is
  'Daily attendance entry per operator. Unique (operator_id, attended_on).';

-- ────────────────────────────────────────────────────────────────────────────
-- audit_logs (structured, written by trigger — not by client)
-- ────────────────────────────────────────────────────────────────────────────
create table public.audit_logs (
  id           bigserial primary key,
  occurred_at  timestamptz not null default now(),
  actor_id     uuid references public.profiles (id) on delete set null,
  actor_name   text,
  entity       public.audit_entity not null,
  entity_id    uuid,
  action       public.audit_action not null,
  before       jsonb,
  after        jsonb,
  diff         jsonb,
  context      jsonb
);

comment on table public.audit_logs is
  'Append-only audit trail. Written by tg_audit trigger; never by application client.';


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000030_indexes.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Indexes tuned for the query patterns expected by the application
-- (sorts by date desc, filters by status, lookups by entity_id, etc.)

-- production_runs
create index idx_production_runs_status_active
  on public.production_runs (status)
  where deleted_at is null;

create index idx_production_runs_resource_status
  on public.production_runs (resource_id, status);

create index idx_production_runs_order
  on public.production_runs (order_id);

create index idx_production_runs_created_at_desc
  on public.production_runs (created_at desc);

create index idx_production_runs_started_at_desc
  on public.production_runs (started_at desc)
  where started_at is not null;

-- production_orders
create index idx_production_orders_order_batch
  on public.production_orders (order_number, batch_number);

create index idx_production_orders_created_at_desc
  on public.production_orders (created_at desc);

-- attendances
create index idx_attendances_attended_on_desc
  on public.attendances (attended_on desc);

create index idx_attendances_operator_date
  on public.attendances (operator_id, attended_on desc);

-- audit_logs
create index idx_audit_logs_occurred_at_desc
  on public.audit_logs (occurred_at desc);

create index idx_audit_logs_entity
  on public.audit_logs (entity, entity_id);

create index idx_audit_logs_actor
  on public.audit_logs (actor_id, occurred_at desc);

-- resources
create index idx_resources_position_active
  on public.resources (position)
  where active and deleted_at is null;

-- profiles
create index idx_profiles_role
  on public.profiles (role)
  where deleted_at is null;

create index idx_operators_active
  on public.operators (full_name)
  where active and deleted_at is null;


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000040_triggers.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Reusable trigger functions

-- ────────────────────────────────────────────────────────────────────────────
-- tg_set_updated_at: keep updated_at fresh on every UPDATE
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at before update on public.resources
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at before update on public.production_orders
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at before update on public.production_runs
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at before update on public.operators
  for each row execute function public.tg_set_updated_at();

create trigger set_updated_at before update on public.attendances
  for each row execute function public.tg_set_updated_at();

-- ────────────────────────────────────────────────────────────────────────────
-- tg_audit: write a structured audit_logs entry after each mutation
-- replaces the client-side useLogStore.addLog pattern of the original repo
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.tg_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity public.audit_entity := tg_argv[0]::public.audit_entity;
  v_action public.audit_action;
  v_entity_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_diff jsonb;
  v_actor_id uuid := auth.uid();
  v_actor_name text;
begin
  if tg_op = 'INSERT' then
    v_action := 'create';
    v_after := to_jsonb(new);
    v_entity_id := (v_after->>'id')::uuid;
  elsif tg_op = 'UPDATE' then
    v_before := to_jsonb(old);
    v_after := to_jsonb(new);
    v_entity_id := (v_after->>'id')::uuid;

    -- Soft delete detection
    if (v_before->>'deleted_at') is null and (v_after->>'deleted_at') is not null then
      v_action := 'delete';
    -- Production-specific lifecycle transitions
    elsif v_entity = 'production_run'
      and (v_before->>'status') = 'pending'
      and (v_after->>'status') = 'active' then
      v_action := 'start';
    elsif v_entity = 'production_run'
      and (v_before->>'status') = 'active'
      and (v_after->>'status') = 'completed' then
      v_action := 'finish';
    elsif v_entity = 'production_run'
      and (v_after->>'status') = 'cancelled' then
      v_action := 'cancel';
    else
      v_action := 'update';
    end if;

    -- Compute key diff (only changed top-level keys)
    select jsonb_object_agg(key, jsonb_build_object('before', v_before->key, 'after', v_after->key))
    into v_diff
    from (
      select key from jsonb_object_keys(v_after) as key
    ) keys
    where coalesce(v_before->key, 'null'::jsonb) is distinct from coalesce(v_after->key, 'null'::jsonb)
      and key not in ('updated_at');
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
    v_before := to_jsonb(old);
    v_entity_id := (v_before->>'id')::uuid;
  end if;

  if v_actor_id is not null then
    select display_name into v_actor_name
    from public.profiles
    where id = v_actor_id;
  end if;

  insert into public.audit_logs
    (occurred_at, actor_id, actor_name, entity, entity_id, action, before, after, diff)
  values
    (now(), v_actor_id, v_actor_name, v_entity, v_entity_id, v_action, v_before, v_after, v_diff);

  return coalesce(new, old);
end;
$$;

-- Attach audit triggers
create trigger audit_profiles after update on public.profiles
  for each row execute function public.tg_audit('profile');

create trigger audit_resources after insert or update or delete on public.resources
  for each row execute function public.tg_audit('resource');

create trigger audit_production_orders after insert or update or delete on public.production_orders
  for each row execute function public.tg_audit('production_order');

create trigger audit_production_runs after insert or update or delete on public.production_runs
  for each row execute function public.tg_audit('production_run');

create trigger audit_operators after insert or update or delete on public.operators
  for each row execute function public.tg_audit('operator');

create trigger audit_attendances after insert or update or delete on public.attendances
  for each row execute function public.tg_audit('attendance');

-- ────────────────────────────────────────────────────────────────────────────
-- handle_new_user: create a profile row when an auth.users row is created
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    coalesce(
      lower(regexp_replace(new.raw_user_meta_data->>'username', '[^a-zA-Z0-9_.-]', '', 'g')),
      lower(split_part(new.email, '@', 1))
    ),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'operator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000050_rls.sql
-- ─────────────────────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000060_materialized_views.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Materialized views for KPI dashboards and ranking

-- ────────────────────────────────────────────────────────────────────────────
-- mv_daily_production: total units + run count per day per resource
-- ────────────────────────────────────────────────────────────────────────────
create materialized view public.mv_daily_production as
select
  date_trunc('day', r.started_at)::date as production_day,
  r.resource_id,
  res.label as resource_label,
  count(*) as runs_count,
  sum(r.units_produced)::numeric(14, 3) as total_units,
  avg(extract(epoch from (r.ended_at - r.started_at)))::numeric(12, 2) as avg_duration_seconds
from public.production_runs r
join public.resources res on res.id = r.resource_id
where r.status = 'completed'
  and r.deleted_at is null
  and r.started_at is not null
  and r.ended_at is not null
group by 1, 2, 3
with no data;

create unique index idx_mv_daily_production_pk
  on public.mv_daily_production (production_day, resource_id);

create index idx_mv_daily_production_day
  on public.mv_daily_production (production_day desc);

-- ────────────────────────────────────────────────────────────────────────────
-- mv_resource_ranking: leaderboard of resources by total completed units
-- ────────────────────────────────────────────────────────────────────────────
create materialized view public.mv_resource_ranking as
select
  r.resource_id,
  res.label,
  res.position,
  sum(r.units_produced)::numeric(14, 3) as total_units,
  count(*)::int as completed_runs,
  max(r.ended_at) as last_completed_at
from public.production_runs r
join public.resources res on res.id = r.resource_id
where r.status = 'completed'
  and r.deleted_at is null
group by 1, 2, 3
with no data;

create unique index idx_mv_resource_ranking_pk
  on public.mv_resource_ranking (resource_id);

-- ────────────────────────────────────────────────────────────────────────────
-- mv_attendance_summary: daily count per status
-- ────────────────────────────────────────────────────────────────────────────
create materialized view public.mv_attendance_summary as
select
  attended_on,
  status,
  count(*)::int as operators_count
from public.attendances
where deleted_at is null
group by 1, 2
with no data;

create unique index idx_mv_attendance_summary_pk
  on public.mv_attendance_summary (attended_on, status);

-- ────────────────────────────────────────────────────────────────────────────
-- refresh_production_mvs(): SECURITY DEFINER RPC for on-demand refresh
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.refresh_production_mvs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.mv_daily_production;
  refresh materialized view concurrently public.mv_resource_ranking;
end;
$$;

create or replace function public.refresh_attendance_mvs()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  refresh materialized view concurrently public.mv_attendance_summary;
end;
$$;

grant execute on function public.refresh_production_mvs() to authenticated;
grant execute on function public.refresh_attendance_mvs() to authenticated;

-- Grants on the MVs for client read
grant select on public.mv_daily_production to authenticated;
grant select on public.mv_resource_ranking to authenticated;
grant select on public.mv_attendance_summary to authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000070_auth_hook.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Custom Access Token Hook
-- Copies profiles.role into JWT app_metadata so middleware can role-check
-- without a database query.
-- See https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_display_name text;
  v_claims jsonb;
begin
  -- Lookup the profile for the user being issued a token
  select role, display_name into v_role, v_display_name
  from public.profiles
  where id = (event->>'user_id')::uuid
    and deleted_at is null;

  v_claims := coalesce(event->'claims', '{}'::jsonb);

  if v_role is not null then
    v_claims := jsonb_set(
      v_claims,
      '{app_metadata}',
      coalesce(v_claims->'app_metadata', '{}'::jsonb)
        || jsonb_build_object('role', v_role::text, 'display_name', v_display_name),
      true
    );
  end if;

  return jsonb_set(event, '{claims}', v_claims, true);
end;
$$;

-- Allow the Supabase auth admin role to call the hook
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant select on public.profiles to supabase_auth_admin;


-- ─────────────────────────────────────────────────────────────────────────
-- 20260517000080_seed_resources.sql
-- ─────────────────────────────────────────────────────────────────────────
-- Seed: 14 reactors (replaces hardcoded RESOURCES constant)

insert into public.resources (code, label, kind, position) values
  ('reator-01', 'Reator 01', 'reactor',  1),
  ('reator-02', 'Reator 02', 'reactor',  2),
  ('reator-03', 'Reator 03', 'reactor',  3),
  ('reator-04', 'Reator 04', 'reactor',  4),
  ('reator-05', 'Reator 05', 'reactor',  5),
  ('reator-06', 'Reator 06', 'reactor',  6),
  ('reator-07', 'Reator 07', 'reactor',  7),
  ('reator-08', 'Reator 08', 'reactor',  8),
  ('reator-09', 'Reator 09', 'reactor',  9),
  ('reator-10', 'Reator 10', 'reactor', 10),
  ('reator-11', 'Reator 11', 'reactor', 11),
  ('reator-12', 'Reator 12', 'reactor', 12),
  ('reator-13', 'Reator 13', 'reactor', 13),
  ('reator-14', 'Reator 14', 'reactor', 14)
on conflict (code) do nothing;

