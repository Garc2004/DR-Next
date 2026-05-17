import * as v from 'valibot';

export const AttendanceStatusSchema = v.picklist([
  'present',
  'other_sector',
  'medical_leave',
  'absent',
  'holiday',
]);
export type AttendanceStatus = v.InferOutput<typeof AttendanceStatusSchema>;

export const AttendanceSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  operator_id: v.pipe(v.string(), v.uuid()),
  attended_on: v.pipe(v.string(), v.isoDate()),
  status: AttendanceStatusSchema,
  note: v.nullable(v.string()),
  recorded_by: v.nullable(v.pipe(v.string(), v.uuid())),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type Attendance = v.InferOutput<typeof AttendanceSchema>;

export const UpsertAttendanceInputSchema = v.object({
  operator_id: v.pipe(v.string(), v.uuid()),
  attended_on: v.pipe(v.string(), v.isoDate()),
  status: AttendanceStatusSchema,
  note: v.optional(v.string()),
});
export type UpsertAttendanceInput = v.InferOutput<typeof UpsertAttendanceInputSchema>;
