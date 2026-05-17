import type { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient, RealtimeChannelSendResponse } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export type WatchedTable =
  | 'production_runs'
  | 'production_orders'
  | 'attendances'
  | 'audit_logs'
  | 'resources'
  | 'operators';

export type RealtimeKey = WatchedTable | 'production_started' | 'production_finished' | 'production_cancelled';

type Listener = (payload: unknown) => void;

export interface RealtimeContextValue {
  on: <T = unknown>(key: RealtimeKey, handler: (payload: T) => void) => () => void;
  send: (event: string, payload: Record<string, unknown>) => Promise<RealtimeChannelSendResponse>;
  dispose: () => void;
}

/**
 * Build ONE realtime channel that multiplexes:
 *  - postgres_changes for every table the apps need
 *  - broadcast events for cross-tab notifications (production_started, …)
 *
 * Use `createRealtimeContext` once per app inside a React Context provider —
 * never per-component. See {@link ./provider.tsx}.
 */
export function createRealtimeContext(
  client: SupabaseClient<Database>,
): RealtimeContextValue {
  const channel: RealtimeChannel = client.channel('dr:main', {
    config: { broadcast: { ack: true, self: false } },
  });

  const listeners = new Map<RealtimeKey, Set<Listener>>();

  function emit(key: RealtimeKey, payload: unknown): void {
    const bucket = listeners.get(key);
    if (!bucket) return;
    for (const fn of bucket) fn(payload);
  }

  channel
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'production_runs' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['production_runs']['Row']>) =>
        emit('production_runs', p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'production_orders' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['production_orders']['Row']>) =>
        emit('production_orders', p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'attendances' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['attendances']['Row']>) =>
        emit('attendances', p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'audit_logs' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['audit_logs']['Row']>) =>
        emit('audit_logs', p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'resources' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['resources']['Row']>) =>
        emit('resources', p),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'operators' },
      (p: RealtimePostgresChangesPayload<Database['public']['Tables']['operators']['Row']>) =>
        emit('operators', p),
    )
    .on('broadcast', { event: 'production_started' }, (p) => emit('production_started', p.payload))
    .on('broadcast', { event: 'production_finished' }, (p) =>
      emit('production_finished', p.payload),
    )
    .on('broadcast', { event: 'production_cancelled' }, (p) =>
      emit('production_cancelled', p.payload),
    )
    .subscribe();

  return {
    on(key, handler) {
      let bucket = listeners.get(key);
      if (!bucket) {
        bucket = new Set();
        listeners.set(key, bucket);
      }
      bucket.add(handler as Listener);
      return () => {
        bucket?.delete(handler as Listener);
        if (bucket && bucket.size === 0) listeners.delete(key);
      };
    },
    send(event, payload) {
      return channel.send({ type: 'broadcast', event, payload });
    },
    dispose() {
      listeners.clear();
      void client.removeChannel(channel);
    },
  };
}
