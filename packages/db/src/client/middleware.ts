import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '../types/database';
import { supabaseCookieOptions } from '../auth/cookie-options';

/**
 * Edge-runtime Supabase client for use inside Next.js middleware.
 * Returns the client alongside a mutable NextResponse with rotated cookies.
 *
 * IMPORTANT: callers should return the returned `response` (or copy its
 * cookies into their own response) so refreshed sessions reach the browser.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });
  const sharedOptions = supabaseCookieOptions();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: any[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, { ...sharedOptions, ...options });
          }
        },
      },
    },
  );

  return { supabase, response };
}
