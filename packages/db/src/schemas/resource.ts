import * as v from 'valibot';

export const ResourceKindSchema = v.picklist(['reactor', 'filler', 'mixer', 'other']);
export type ResourceKind = v.InferOutput<typeof ResourceKindSchema>;

export const ResourceSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  code: v.pipe(v.string(), v.minLength(2), v.maxLength(64)),
  label: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  kind: ResourceKindSchema,
  position: v.pipe(v.number(), v.integer(), v.minValue(0)),
  active: v.boolean(),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type Resource = v.InferOutput<typeof ResourceSchema>;

export const CreateResourceInputSchema = v.object({
  code: v.pipe(v.string(), v.regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, dígitos e hífens')),
  label: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  kind: v.optional(ResourceKindSchema, 'reactor'),
  position: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
});
export type CreateResourceInput = v.InferOutput<typeof CreateResourceInputSchema>;

export const UpdateResourceInputSchema = v.partial(CreateResourceInputSchema);
export type UpdateResourceInput = v.InferOutput<typeof UpdateResourceInputSchema>;
