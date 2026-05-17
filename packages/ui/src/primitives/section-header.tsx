import * as React from 'react';
import { cn } from '../lib/cn';

interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <header className={cn('mb-6 flex items-start justify-between gap-4', className)} {...props}>
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{title}</h1>
        {subtitle ? <p className="text-sm text-[var(--color-ink-mid)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
