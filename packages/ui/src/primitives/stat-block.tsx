import * as React from 'react';
import { cn } from '../lib/cn';

interface StatBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: boolean;
  loading?: boolean;
}

export function StatBlock({
  label,
  value,
  hint,
  accent = false,
  loading = false,
  className,
  ...props
}: StatBlockProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-base)]',
        className,
      )}
      {...props}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
        {label}
      </p>
      {loading ? (
        <div className="mt-2 h-8 w-24 animate-pulse rounded bg-[var(--color-surface-alt)]" />
      ) : (
        <p
          className={cn(
            'mt-1 text-3xl font-semibold tabular-nums tracking-tight',
            accent ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]',
          )}
        >
          {value}
        </p>
      )}
      {hint ? <p className="mt-1 text-xs text-[var(--color-ink-mid)]">{hint}</p> : null}
    </div>
  );
}
