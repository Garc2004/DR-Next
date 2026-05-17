import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AuditLog } from '../types/database';
import type { AuditFilters } from '../schemas/audit-log';

export async function listAuditLogs(
  client: SupabaseClient<Database>,
  filters?: AuditFilters,
  pageSize = 100,
): Promise<AuditLog[]> {
  let query = client
    .from('audit_logs')
    .select('*')
    .order('occurred_at', { ascending: false })
    .limit(pageSize);

  if (filters?.entity && filters.entity !== 'all') {
    query = query.eq('entity', filters.entity);
  }
  if (filters?.action && filters.action !== 'all') {
    query = query.eq('action', filters.action);
  }
  if (filters?.actor_id && filters.actor_id !== 'all') {
    query = query.eq('actor_id', filters.actor_id);
  }
  if (filters?.date_from) {
    query = query.gte('occurred_at', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('occurred_at', filters.date_to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
