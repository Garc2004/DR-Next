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
