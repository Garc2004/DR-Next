import * as React from 'react';
import { cn } from '../lib/cn';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-[var(--color-ink-mid)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-medium text-[var(--color-ink)]">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-[var(--color-ink-mid)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
