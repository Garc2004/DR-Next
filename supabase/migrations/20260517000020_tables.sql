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
