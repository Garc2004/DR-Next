import * as v from 'valibot';

export const AuditEntitySchema = v.picklist([
  'production_order',
  'production_run',
  'attendance',
  'operator',
  'resource',
  'profile',
]);
export type AuditEntity = v.InferOutput<typeof AuditEntitySchema>;

export const AuditActionSchema = v.picklist([
  'create',
  'update',
  'delete',
  'start',
  'finish',
  'cancel',
]);
export type AuditAction = v.InferOutput<typeof AuditActionSchema>;

export const AuditFiltersSchema = v.object({
  entity: v.optional(v.union([v.literal('all'), AuditEntitySchema]), 'all'),
  action: v.optional(v.union([v.literal('all'), AuditActionSchema]), 'all'),
  actor_id: v.optional(v.union([v.literal('all'), v.pipe(v.string(), v.uuid())]), 'all'),
  date_from: v.optional(v.nullable(v.pipe(v.string(), v.isoDate()))),
  date_to: v.optional(v.nullable(v.pipe(v.string(), v.isoDate()))),
});
export type AuditFilters = v.InferOutput<typeof AuditFiltersSchema>;
