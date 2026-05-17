'use client';

import { atom } from 'jotai';

export type ProductionDialogKind =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'finish'; runId: string }
  | { kind: 'cancel'; runId: string }
  | { kind: 'delete'; runId: string }
  | { kind: 'confirm-start'; runId: string; conflictingRunId?: string };

export const productionDialogAtom = atom<ProductionDialogKind>({ kind: 'none' });
