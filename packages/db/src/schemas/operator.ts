import * as v from 'valibot';

export const OperatorSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  full_name: v.pipe(v.string(), v.minLength(2), v.maxLength(120)),
  job_title: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  active: v.boolean(),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type Operator = v.InferOutput<typeof OperatorSchema>;

export const CreateOperatorInputSchema = v.object({
  full_name: v.pipe(v.string(), v.minLength(2), v.maxLength(120)),
  job_title: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
});
export type CreateOperatorInput = v.InferOutput<typeof CreateOperatorInputSchema>;

export const UpdateOperatorInputSchema = v.partial(
  v.object({
    full_name: v.pipe(v.string(), v.minLength(2), v.maxLength(120)),
    job_title: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
    active: v.boolean(),
  }),
);
export type UpdateOperatorInput = v.InferOutput<typeof UpdateOperatorInputSchema>;
