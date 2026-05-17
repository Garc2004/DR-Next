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
