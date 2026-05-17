'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Button,
  EmptyState,
  SectionHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusDot,
  SurfaceCard,
} from '@dr/ui';
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_TOKENS,
  type AttendanceStatus,
} from '@dr/db/enums';
import { attendanceMonthAtom } from '@/lib/atoms/filters';
import { useAttendanceMonth, useOperators, useUpsertAttendance } from '@/features/attendance/hooks';

const MONTH_LABEL = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function AttendanceGrid() {
  const [period, setPeriod] = useAtom(attendanceMonthAtom);
  const operators = useOperators();
  const attendances = useAttendanceMonth(period.year, period.month);
  const upsert = useUpsertAttendance();

  const days = React.useMemo(
    () => Array.from({ length: daysInMonth(period.year, period.month) }, (_, i) => i + 1),
    [period.year, period.month],
  );

  const lookup = React.useMemo(() => {
    const map = new Map<string, { id: string; status: AttendanceStatus; note: string | null }>();
    for (const a of attendances.data ?? []) {
      map.set(`${a.operator_id}:${a.attended_on}`, {
        id: a.id,
        status: a.status,
        note: a.note,
      });
    }
    return map;
  }, [attendances.data]);

  function prevMonth() {
    const d = new Date(period.year, period.month - 1, 1);
    setPeriod({ year: d.getFullYear(), month: d.getMonth() });
  }
  function nextMonth() {
    const d = new Date(period.year, period.month + 1, 1);
    setPeriod({ year: d.getFullYear(), month: d.getMonth() });
  }

  function dateFor(day: number): string {
    return `${period.year}-${String(period.month + 1).padStart(2, '0')}-${String(day).padStart(
      2,
      '0',
    )}`;
  }

  if (!operators.isLoading && (operators.data?.length ?? 0) === 0) {
    return (
      <EmptyState
        title="Nenhum operador cadastrado"
        description="Solicite ao líder o cadastro dos operadores antes de registrar a assiduidade."
      />
    );
  }

  return (
    <>
      <SectionHeader
        title="Assiduidade"
        subtitle="Marque presenças dia a dia. As mudanças são salvas automaticamente."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Mês anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium capitalize">
              {MONTH_LABEL.format(new Date(period.year, period.month, 1))}
            </span>
            <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <SurfaceCard padding="none" className="overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10 bg-[var(--color-surface)]">
              <tr className="border-b border-[var(--color-border)]">
                <th className="sticky left-0 z-10 min-w-48 bg-[var(--color-surface)] px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                  Operador
                </th>
                {days.map((d) => (
                  <th
                    key={d}
                    className="min-w-12 px-1 py-2 text-center text-[10px] font-medium text-[var(--color-ink-muted)]"
                  >
                    {String(d).padStart(2, '0')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.data?.map((op) => (
                <tr key={op.id} className="border-b border-[var(--color-border)]">
                  <td className="sticky left-0 z-10 bg-[var(--color-surface)] px-3 py-2">
                    <div className="font-medium text-[var(--color-ink)]">{op.full_name}</div>
                    <div className="text-[10px] text-[var(--color-ink-muted)]">{op.job_title}</div>
                  </td>
                  {days.map((day) => {
                    const date = dateFor(day);
                    const entry = lookup.get(`${op.id}:${date}`);
                    return (
                      <td key={day} className="p-0.5 text-center">
                        <Select
                          value={entry?.status ?? ''}
                          onValueChange={(v) =>
                            upsert.mutate({
                              operator_id: op.id,
                              attended_on: date,
                              status: v as AttendanceStatus,
                            })
                          }
                        >
                          <SelectTrigger
                            className="h-7 w-full justify-center border-transparent px-1 hover:border-[var(--color-border)]"
                            aria-label={`Status ${op.full_name} dia ${day}`}
                          >
                            {entry ? (
                              <StatusDot color={ATTENDANCE_STATUS_TOKENS[entry.status]} />
                            ) : (
                              <SelectValue placeholder="·" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                <span className="inline-flex items-center gap-2">
                                  <StatusDot color={ATTENDANCE_STATUS_TOKENS[s]} />
                                  {ATTENDANCE_STATUS_LABELS[s]}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </>
  );
}
