'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPtBR, formatPtBRCompact } from './lib/format';

export interface CumulativeDataPoint {
  day: string;
  cumulative: number;
}

interface Props {
  data: CumulativeDataPoint[];
  height?: number;
}

export function CumulativeLineChart({ data, height = 280 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 24 }}>
        <defs>
          <linearGradient id="cumulative-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          cursor={{ stroke: 'var(--color-border-strong)' }}
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value: number) => [formatPtBR(value), 'Acumulado']}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="var(--color-ink)"
          strokeWidth={1.5}
          fill="url(#cumulative-fill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
