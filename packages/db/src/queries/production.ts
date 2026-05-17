import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProductionRun, ProductionOrder, Resource } from '../types/database';
import type { ProductionFilters } from '../schemas/production-run';

export type ProductionRunWithRelations = ProductionRun & {
  order: ProductionOrder | null;
  resource: Resource | null;
};

const RUN_SELECT =
  '*, order:production_orders!order_id(*), resource:resources!resource_id(*)' as const;

export async function listProductionRuns(
  client: SupabaseClient<Database>,
  filters?: ProductionFilters,
): Promise<ProductionRunWithRelations[]> {
  let query = client
    .from('production_runs')
    .select(RUN_SELECT)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters?.resource_id && filters.resource_id !== 'all') {
    query = query.eq('resource_id', filters.resource_id);
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ProductionRunWithRelations[];
}

export async function getProductionRun(
  client: SupabaseClient<Database>,
  id: string,
): Promise<ProductionRunWithRelations | null> {
  const { data, error } = await client
    .from('production_runs')
    .select(RUN_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data as ProductionRunWithRelations | null;
}

export interface CreateRunArgs {
  order_number: number;
  batch_number: number;
  resource_id: string;
  product_name?: string;
  notes?: string;
  created_by: string;
}

export async function createProductionRun(
  client: SupabaseClient<Database>,
  args: CreateRunArgs,
): Promise<ProductionRun> {
  // 1. Upsert order (idempotent on order_number + batch_number)
  const { data: order, error: orderErr } = await client
    .from('production_orders')
    .upsert(
      {
        order_number: args.order_number,
        batch_number: args.batch_number,
        product_name: args.product_name ?? null,
        notes: args.notes ?? null,
        created_by: args.created_by,
      },
      { onConflict: 'order_number,batch_number' },
    )
    .select()
    .single();
  if (orderErr) throw orderErr;

  // 2. Insert run linked to order
  const { data: run, error: runErr } = await client
    .from('production_runs')
    .insert({
      order_id: order.id,
      resource_id: args.resource_id,
      status: 'pending',
      created_by: args.created_by,
    })
    .select()
    .single();
  if (runErr) throw runErr;

  return run;
}

export async function startProductionRun(
  client: SupabaseClient<Database>,
  id: string,
  startedBy: string,
): Promise<ProductionRun> {
  const { data, error } = await client
    .from('production_runs')
    .update({
      status: 'active',
      started_at: new Date().toISOString(),
      started_by: startedBy,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finishProductionRun(
  client: SupabaseClient<Database>,
  args: { id: string; units_produced: number; finished_by: string },
): Promise<ProductionRun> {
  const { data, error } = await client
    .from('production_runs')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      units_produced: args.units_produced,
      finished_by: args.finished_by,
    })
    .eq('id', args.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelProductionRun(
  client: SupabaseClient<Database>,
  id: string,
): Promise<ProductionRun> {
  const { data, error } = await client
    .from('production_runs')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function softDeleteProductionRun(
  client: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('production_runs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function getActiveRunForResource(
  client: SupabaseClient<Database>,
  resourceId: string,
): Promise<ProductionRunWithRelations | null> {
  const { data, error } = await client
    .from('production_runs')
    .select(RUN_SELECT)
    .eq('resource_id', resourceId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  return data as ProductionRunWithRelations | null;
}
