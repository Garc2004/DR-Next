import 'server-only';

import { cache } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getServerClient } from '../client/server';
import type { UserRole } from '../enums';

interface SessionPayload {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  displayName: string | null;
}

/**
 * React cache()d helper that returns the current session, user and role.
 * Safe to call from multiple RSC layers — only one DB hit per request.
 */
export const getSession = cache(async (): Promise<SessionPayload> => {
  const supabase = await getServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return { session: null, user: null, role: null, displayName: null };
  }

  const role = (user.app_metadata.role as UserRole | undefined) ?? null;
  const displayName = (user.app_metadata.display_name as string | undefined) ?? null;
  const { data: sessionData } = await supabase.auth.getSession();

  return { session: sessionData.session, user, role, displayName };
});

export async function requireSession(): Promise<SessionPayload & { user: User; role: UserRole }> {
  const payload = await getSession();
  if (!payload.user || !payload.role) {
    throw new Error('Not authenticated');
  }
  return payload as SessionPayload & { user: User; role: UserRole };
}

export async function requireLeader(): Promise<SessionPayload & { user: User; role: 'leader' }> {
  const payload = await requireSession();
  if (payload.role !== 'leader') {
    throw new Error('Not authorized: leader role required');
  }
  return payload as SessionPayload & { user: User; role: 'leader' };
}
