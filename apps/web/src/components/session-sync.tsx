'use client';

import * as React from 'react';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@dr/db/client/browser';
import { sessionAtom } from '@/lib/atoms/session';

/**
 * Syncs Supabase auth state into the Jotai sessionAtom. Mounted once inside
 * the authenticated AppShell. Triggers a router.refresh() on sign-out so RSC
 * data is re-fetched as anonymous.
 */
export function SessionSync() {
  const setSession = useSetAtom(sessionAtom);
  const router = useRouter();

  React.useEffect(() => {
    const supabase = getBrowserClient();

    void supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, router]);

  return null;
}
