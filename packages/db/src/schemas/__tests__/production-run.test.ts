import { describe, expect, it } from 'vitest';
import * as v from 'valibot';
import {
  CreateRunInputSchema,
  FinishRunInputSchema,
  ProductionStatusSchema,
} from '../production-run';

describe('ProductionStatusSchema', () => {
  it('accepts valid statuses', () => {
    for (const s of ['pending', 'active', 'completed', 'cancelled'] as const) {
      expect(v.safeParse(ProductionStatusSchema, s).success).toBe(true);
    }
  });

  it('rejects unknown statuses', () => {
    expect(v.safeParse(ProductionStatusSchema, 'paused').success).toBe(false);
  });
});

describe('FinishRunInputSchema', () => {
  it('requires positive units', () => {
    const ok = v.safeParse(FinishRunInputSchema, {
      id: '550e8400-e29b-41d4-a716-446655440000',
      units_produced: 12.5,
    });
    expect(ok.success).toBe(true);
  });

  it('rejects zero or negative units', () => {
    const zero = v.safeParse(FinishRunInputSchema, {
      id: '550e8400-e29b-41d4-a716-446655440000',
      units_produced: 0,
    });
    expect(zero.success).toBe(false);
  });
});

describe('CreateRunInputSchema', () => {
  it('accepts valid input', () => {
    const r = v.safeParse(CreateRunInputSchema, {
      order_id: '550e8400-e29b-41d4-a716-446655440000',
      resource_id: '550e8400-e29b-41d4-a716-446655440001',
    });
    expect(r.success).toBe(true);
  });

  it('rejects non-uuid resource_id', () => {
    const r = v.safeParse(CreateRunInputSchema, {
      order_id: '550e8400-e29b-41d4-a716-446655440000',
      resource_id: 'not-a-uuid',
    });
    expect(r.success).toBe(false);
  });
});
