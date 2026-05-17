'use client';

import { atomWithStorage } from 'jotai/utils';

export type ThemeMode = 'light' | 'system';

export const themeAtom = atomWithStorage<ThemeMode>('dr-theme', 'light');
