import * as v from 'valibot';

export const ProductionStatusSchema = v.picklist(['pending', 'active', 'completed', 'cancelled']);
export type ProductionStatus = v.InferOutput<typeof ProductionStatusSchema>;

export const ProductionRunSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  order_id: v.pipe(v.string(), v.uuid()),
  resource_id: v.pipe(v.string(), v.uuid()),
  status: ProductionStatusSchema,
  units_produced: v.pipe(v.number(), v.minValue(0)),
  started_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  ended_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
  started_by: v.nullable(v.pipe(v.string(), v.uuid())),
  finished_by: v.nullable(v.pipe(v.string(), v.uuid())),
  created_by: v.nullable(v.pipe(v.string(), v.uuid())),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type ProductionRun = v.InferOutput<typeof ProductionRunSchema>;

export const CreateRunInputSchema = v.object({
  order_id: v.pipe(v.string(), v.uuid()),
  resource_id: v.pipe(v.string(), v.uuid()),
});
export type CreateRunInput = v.InferOutput<typeof CreateRunInputSchema>;

export const StartRunInputSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
});
export type StartRunInput = v.InferOutput<typeof StartRunInputSchema>;

export const FinishRunInputSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  units_produced: v.pipe(
    v.number(),
    v.minValue(0.001, 'O volume produzido deve ser positivo'),
    v.maxValue(999_999, 'Volume excede o limite'),
  ),
});
export type FinishRunInput = v.InferOutput<typeof FinishRunInputSchema>;

export const UpdateRunInputSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  units_produced: v.optional(v.pipe(v.number(), v.minValue(0))),
  started_at: v.optional(v.nullable(v.pipe(v.string(), v.isoTimestamp()))),
  ended_at: v.optional(v.nullable(v.pipe(v.string(), v.isoTimestamp()))),
  status: v.optional(ProductionStatusSchema),
});
export type UpdateRunInput = v.InferOutput<typeof UpdateRunInputSchema>;

export const ProductionFiltersSchema = v.object({
  resource_id: v.optional(v.union([v.literal('all'), v.pipe(v.string(), v.uuid())]), 'all'),
  status: v.optional(v.union([v.literal('all'), ProductionStatusSchema]), 'all'),
  date_from: v.optional(v.nullable(v.pipe(v.string(), v.isoDate()))),
  date_to: v.optional(v.nullable(v.pipe(v.string(), v.isoDate()))),
  query: v.optional(v.string(), ''),
});
export type ProductionFilters = v.InferOutput<typeof ProductionFiltersSchema>;
