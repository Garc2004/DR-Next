'use client';

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ProductionFilters } from '@dr/db/schemas/production-run';

export const productionFiltersAtom = atomWithStorage<ProductionFilters>('dr-production-filters', {
  resource_id: 'all',
  status: 'all',
  date_from: null,
  date_to: null,
  query: '',
});

const now = new Date();
export const attendanceMonthAtom = atomWithStorage<{ year: number; month: number }>(
  'dr-attendance-month',
  { year: now.getFullYear(), month: now.getMonth() },
);

export const graficoMonthAtom = atom<string>('all');
