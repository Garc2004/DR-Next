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
