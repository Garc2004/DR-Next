import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Operator } from '../types/database';

export async function listOperators(
  client: SupabaseClient<Database>,
  options?: { active?: boolean },
): Promise<Operator[]> {
  let query = client
    .from('operators')
    .select('*')
    .is('deleted_at', null)
    .order('full_name', { ascending: true });

  if (options?.active !== undefined) {
    query = query.eq('active', options.active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createOperator(
  client: SupabaseClient<Database>,
  input: { full_name: string; job_title: string },
): Promise<Operator> {
  const { data, error } = await client.from('operators').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateOperator(
  client: SupabaseClient<Database>,
  id: string,
  input: Partial<{ full_name: string; job_title: string; active: boolean }>,
): Promise<Operator> {
  const { data, error } = await client
    .from('operators')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
