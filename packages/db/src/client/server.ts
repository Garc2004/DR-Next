import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '../types/database';
import { supabaseCookieOptions } from '../auth/cookie-options';

/**
 * Server-side Supabase client for React Server Components and Route Handlers.
 * Reads the session cookie from next/headers and rotates it when Supabase
 * refreshes the access token.
 */
export async function getServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const sharedOptions = supabaseCookieOptions();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, { ...sharedOptions, ...options });
            }
          } catch {
            // Server Components cannot set cookies. The middleware client
            // refreshes the session on the next request.
          }
        },
      },
    },
  ) as any as SupabaseClient<Database>;
}

/**
 * Service-role client. Use SPARINGLY and only on the server (route handlers,
 * server actions, edge functions). Bypasses RLS.
 */
export function getServiceRoleClient(): SupabaseClient<Database> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  // Imported lazily to avoid pulling node-side deps into edge bundles.
  const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  ) as any as SupabaseClient<Database>;
}
