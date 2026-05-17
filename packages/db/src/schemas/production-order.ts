import * as v from 'valibot';

export const ProductionOrderSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  order_number: v.pipe(v.number(), v.integer(), v.minValue(0)),
  batch_number: v.pipe(v.number(), v.integer(), v.minValue(0)),
  product_name: v.nullable(v.string()),
  notes: v.nullable(v.string()),
  created_by: v.nullable(v.pipe(v.string(), v.uuid())),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type ProductionOrder = v.InferOutput<typeof ProductionOrderSchema>;

/**
 * Input shape for the "Novo registro" dialog. order_number and batch_number
 * arrive from the form as strings (the user types them) and are validated +
 * transformed to numbers here.
 */
export const CreateProductionOrderInputSchema = v.pipe(
  v.object({
    order_number: v.pipe(
      v.string(),
      v.regex(/^\d{6,10}$/, 'A ordem deve conter entre 6 e 10 dígitos'),
    ),
    batch_number: v.pipe(
      v.string(),
      v.regex(/^\d{6,12}$/, 'O lote deve conter entre 6 e 12 dígitos'),
    ),
    product_name: v.optional(v.pipe(v.string(), v.minLength(2))),
    notes: v.optional(v.string()),
  }),
  v.transform((input) => ({
    ...input,
    order_number: Number(input.order_number),
    batch_number: Number(input.batch_number),
  })),
);
export type CreateProductionOrderInput = v.InferOutput<typeof CreateProductionOrderInputSchema>;
