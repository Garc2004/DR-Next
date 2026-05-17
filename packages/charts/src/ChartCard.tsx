import * as React from 'react';
import { cn } from '@dr/ui';

interface ChartCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartCard({
  eyebrow,
  title,
  subtitle,
  actions,
  footer,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-base)]',
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <div className="space-y-0.5">
          {eyebrow ? (
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
          {subtitle ? (
            <p className="text-xs text-[var(--color-ink-mid)]">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </header>
      <div className="px-2 pb-2 pt-4">{children}</div>
      {footer ? (
        <footer className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-ink-muted)]">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
