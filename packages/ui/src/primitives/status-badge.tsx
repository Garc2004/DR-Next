import * as React from 'react';
import { cn } from '../lib/cn';
import { StatusDot } from './status-dot';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  color: string;
  pulse?: boolean;
}

export function StatusBadge({ label, color, pulse = false, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-mid)]',
        className,
      )}
      {...props}
    >
      <StatusDot color={color} pulse={pulse} />
      {label}
    </span>
  );
}
