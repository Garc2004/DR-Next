import type { CookieOptions } from '@supabase/ssr';

/**
 * Shared cookie configuration used by every Supabase client in the monorepo.
 * In production, set NEXT_PUBLIC_AUTH_COOKIE_DOMAIN to a dot-prefixed parent
 * domain (e.g. ".dr.example.com") so apps/web and apps/admin share the session.
 *
 * In local development leave the value as `localhost` or undefined to let the
 * browser default to the host-only cookie.
 */
export function supabaseCookieOptions(): CookieOptions {
  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  return {
    domain: domain && domain !== 'localhost' ? domain : undefined,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  };
}

export const SUPABASE_COOKIE_NAME = 'sb-dr-auth';
