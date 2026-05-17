import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Resource } from '../types/database';

export async function listResources(
  client: SupabaseClient<Database>,
  options?: { active?: boolean },
): Promise<Resource[]> {
  let query = client
    .from('resources')
    .select('*')
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (options?.active !== undefined) {
    query = query.eq('active', options.active);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createResource(
  client: SupabaseClient<Database>,
  input: { code: string; label: string; kind?: Resource['kind']; position?: number },
): Promise<Resource> {
  const { data, error } = await client
    .from('resources')
    .insert({
      code: input.code,
      label: input.label,
      kind: input.kind ?? 'reactor',
      position: input.position ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateResource(
  client: SupabaseClient<Database>,
  id: string,
  input: Partial<{ label: string; kind: Resource['kind']; position: number; active: boolean }>,
): Promise<Resource> {
  const { data, error } = await client
    .from('resources')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
