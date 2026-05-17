'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPtBR, formatPtBRCompact } from './lib/format';

export interface ResourceRankingPoint {
  label: string;
  total: number;
}

interface Props {
  data: ResourceRankingPoint[];
  height?: number;
}

export function ResourceRankingChart({ data, height = 360 }: Props) {
  const sorted = [...data].sort((a, b) => b.total - a.total);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--color-ink-muted)"
          tickFormatter={formatPtBRCompact}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={80}
          fontSize={12}
          stroke="var(--color-ink-muted)"
        />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-alt)' }}
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [formatPtBR(value), 'Volume total']}
        />
        <Bar dataKey="total" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
