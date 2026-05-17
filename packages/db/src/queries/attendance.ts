import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Attendance, AttendanceSummaryRow } from '../types/database';
import type { AttendanceStatus } from '../schemas/attendance';

export interface AttendanceMonthRow {
  operator_id: string;
  operator_name: string;
  job_title: string;
  entries: Record<string, { id: string; status: AttendanceStatus; note: string | null }>;
}

export async function listAttendanceForMonth(
  client: SupabaseClient<Database>,
  year: number,
  month: number,
): Promise<Attendance[]> {
  const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const to = new Date(year, month + 1, 1).toISOString().slice(0, 10);

  const { data, error } = await client
    .from('attendances')
    .select('*')
    .gte('attended_on', from)
    .lt('attended_on', to)
    .is('deleted_at', null);
  if (error) throw error;
  return data ?? [];
}

export async function upsertAttendance(
  client: SupabaseClient<Database>,
  input: {
    operator_id: string;
    attended_on: string;
    status: AttendanceStatus;
    note?: string | null;
    recorded_by: string;
  },
): Promise<Attendance> {
  const { data, error } = await client
    .from('attendances')
    .upsert(
      {
        operator_id: input.operator_id,
        attended_on: input.attended_on,
        status: input.status,
        note: input.note ?? null,
        recorded_by: input.recorded_by,
      },
      { onConflict: 'operator_id,attended_on' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAttendanceSummary(
  client: SupabaseClient<Database>,
  fromDate: string,
  toDate: string,
): Promise<AttendanceSummaryRow[]> {
  const { data, error } = await client
    .from('mv_attendance_summary')
    .select('*')
    .gte('attended_on', fromDate)
    .lte('attended_on', toDate)
    .order('attended_on', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
