'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { supabaseCookieOptions } from '../auth/cookie-options';

let cached: SupabaseClient<Database> | undefined;

/**
 * Browser-side Supabase client. Memoised on the module so realtime channels
 * and auth listeners are not duplicated when React re-renders.
 */
export function getBrowserClient(): SupabaseClient<Database> {
  if (cached) return cached;

  cached = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: supabaseCookieOptions(),
      realtime: {
        params: { eventsPerSecond: 10 },
      },
    },
  ) as any as SupabaseClient<Database>;

  return cached;
}
