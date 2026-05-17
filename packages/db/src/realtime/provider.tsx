'use client';

import * as React from 'react';
import { getBrowserClient } from '../client/browser';
import { createRealtimeContext, type RealtimeContextValue, type RealtimeKey } from './channel';

const RealtimeContext = React.createContext<RealtimeContextValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo<RealtimeContextValue>(() => {
    const client = getBrowserClient();
    return createRealtimeContext(client);
  }, []);

  React.useEffect(() => () => value.dispose(), [value]);

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeContext(): RealtimeContextValue {
  const ctx = React.useContext(RealtimeContext);
  if (!ctx) {
    throw new Error('useRealtimeContext must be used inside <RealtimeProvider>');
  }
  return ctx;
}

/**
 * Subscribe to a realtime key for the lifetime of the component.
 * The handler reference is captured in a ref so consumers don't have to
 * memoise it.
 */
export function useRealtimeSubscription<T = unknown>(
  key: RealtimeKey,
  handler: (payload: T) => void,
): void {
  const ctx = useRealtimeContext();
  const handlerRef = React.useRef(handler);
  handlerRef.current = handler;

  React.useEffect(() => {
    return ctx.on<T>(key, (payload) => handlerRef.current(payload));
  }, [ctx, key]);
}
