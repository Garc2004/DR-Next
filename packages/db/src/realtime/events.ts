// Strongly-typed event names + payload shapes for the broadcast channel.
// Postgres change events use the table names directly.

export const BROADCAST_EVENTS = {
  productionStarted: 'production_started',
  productionFinished: 'production_finished',
  productionCancelled: 'production_cancelled',
} as const;

export type BroadcastEventName = (typeof BROADCAST_EVENTS)[keyof typeof BROADCAST_EVENTS];

export interface ProductionStartedPayload {
  id: string;
  resource_id: string;
  started_at: string;
  actor_id: string | null;
}

export interface ProductionFinishedPayload {
  id: string;
  resource_id: string;
  units: number;
  ended_at: string;
  actor_id: string | null;
}

export interface ProductionCancelledPayload {
  id: string;
  resource_id: string;
  actor_id: string | null;
}
