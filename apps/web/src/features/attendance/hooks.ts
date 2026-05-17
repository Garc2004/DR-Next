'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { getBrowserClient } from '@dr/db/client/browser';
import { qk } from '@dr/db/queries/keys';
import {
  listAttendanceForMonth,
  upsertAttendance,
} from '@dr/db/queries/attendance';
import { listOperators } from '@dr/db/queries/operators';
import type { AttendanceStatus } from '@dr/db/schemas/attendance';
import { useRealtimeSubscription } from '@dr/db/realtime/provider';
import { toast } from '@dr/ui';
import { userAtom } from '@/lib/atoms/session';

export function useOperators() {
  return useQuery({
    queryKey: qk.operators.list(true),
    queryFn: () => listOperators(getBrowserClient(), { active: true }),
  });
}

export function useAttendanceMonth(year: number, month: number) {
  const qc = useQueryClient();
  useRealtimeSubscription('attendances', () => {
    qc.invalidateQueries({ queryKey: qk.attendance.all });
  });
  return useQuery({
    queryKey: qk.attendance.month(year, month),
    queryFn: () => listAttendanceForMonth(getBrowserClient(), year, month),
  });
}

interface UpsertVars {
  operator_id: string;
  attended_on: string;
  status: AttendanceStatus;
  note?: string | null;
}

export function useUpsertAttendance() {
  const qc = useQueryClient();
  const user = useAtomValue(userAtom);
  return useMutation({
    mutationFn: async (vars: UpsertVars) => {
      if (!user) throw new Error('Não autenticado');
      return upsertAttendance(getBrowserClient(), { ...vars, recorded_by: user.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.attendance.all }),
    onError: (err: Error) =>
      toast.error('Erro ao salvar presença', { description: err.message }),
  });
}
