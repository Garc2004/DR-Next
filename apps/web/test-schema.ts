import * as v from 'valibot';

const Schema = v.object({
  order_number: v.pipe(v.string(), v.regex(/^\d{6,10}$/, 'Ordem deve ter 6 a 10 dígitos')),
  batch_number: v.pipe(v.string(), v.regex(/^\d{6,12}$/, 'Lote deve ter 6 a 12 dígitos')),
  resource_id: v.pipe(v.string(), v.uuid('Selecione um reator')),
  product_name: v.optional(v.string()),
  notes: v.optional(v.string()),
});

type Input = v.InferOutput<typeof Schema>;

const i: Input = {
  order_number: '123',
  batch_number: '123',
  resource_id: '123',
};
