'use client';

import { atom } from 'jotai';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '@dr/db/enums';

export const sessionAtom = atom<Session | null>(null);
export const userAtom = atom<User | null>((get) => get(sessionAtom)?.user ?? null);
export const userRoleAtom = atom<UserRole | null>((get) => {
  const user = get(userAtom);
  const role = (user?.app_metadata?.role as UserRole | undefined) ?? null;
  return role;
});
export const isLeaderAtom = atom<boolean>((get) => get(userRoleAtom) === 'leader');
export const displayNameAtom = atom<string | null>((get) => {
  const user = get(userAtom);
  return (
    (user?.app_metadata?.display_name as string | undefined) ??
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    null
  );
});
