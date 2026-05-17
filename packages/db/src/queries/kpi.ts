import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  DailyProductionRow,
  ResourceRankingRow,
} from '../types/database';

export async function getDailyProduction(
  client: SupabaseClient<Database>,
  fromDate: string,
  toDate: string,
): Promise<DailyProductionRow[]> {
  const { data, error } = await client
    .from('mv_daily_production')
    .select('*')
    .gte('production_day', fromDate)
    .lte('production_day', toDate)
    .order('production_day', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getResourceRanking(
  client: SupabaseClient<Database>,
): Promise<ResourceRankingRow[]> {
  const { data, error } = await client
    .from('mv_resource_ranking')
    .select('*')
    .order('total_units', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface ProductionKpi {
  total_units: number;
  total_runs: number;
  active_runs: number;
  avg_duration_minutes: number;
}

export async function getProductionKpi(client: SupabaseClient<Database>): Promise<ProductionKpi> {
  const ranking = await getResourceRanking(client);
  const total_units = ranking.reduce((sum, r) => sum + Number(r.total_units), 0);
  const total_runs = ranking.reduce((sum, r) => sum + r.completed_runs, 0);

  const { count: active_runs } = await client
    .from('production_runs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .is('deleted_at', null);

  return {
    total_units,
    total_runs,
    active_runs: active_runs ?? 0,
    avg_duration_minutes: 0,
  };
}
