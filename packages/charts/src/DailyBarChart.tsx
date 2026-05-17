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

export interface DailyDataPoint {
  day: string;
  units: number;
}

interface Props {
  data: DailyDataPoint[];
  height?: number;
}

export function DailyBarChart({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--color-ink-muted)"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={formatPtBRCompact}
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
          labelStyle={{ color: 'var(--color-ink-mid)' }}
          formatter={(value: number) => [formatPtBR(value), 'Volume']}
        />
        <Bar dataKey="units" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
