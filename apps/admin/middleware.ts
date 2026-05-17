import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@dr/db/client/middleware';

const PUBLIC_PATHS = ['/_next', '/api/health', '/favicon.ico', '/forbidden'];

function isPublic(p: string): boolean {
  return PUBLIC_PATHS.some((x) => p === x || p.startsWith(`${x}/`));
}

export async function middleware(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) return NextResponse.next();

  const { supabase, response } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001';
    const next = `${adminUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(`${webUrl}/login?next=${encodeURIComponent(next)}`);
  }

  // Role gate — claim comes from the Custom Access Token Hook
  const role = user.app_metadata?.role;
  if (role !== 'leader') {
    return NextResponse.rewrite(new URL('/forbidden', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)',
  ],
};
