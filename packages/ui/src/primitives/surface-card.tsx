import * as React from 'react';
import { cn } from '../lib/cn';

interface SurfaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padding = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function SurfaceCard({
  eyebrow,
  title,
  actions,
  padding: paddingProp = 'md',
  className,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-base)]',
        className,
      )}
      {...props}
    >
      {(eyebrow || title || actions) && (
        <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="space-y-0.5">
            {eyebrow ? (
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h3 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h3>
            ) : null}
          </div>
          {actions}
        </header>
      )}
      <div className={padding[paddingProp]}>{children}</div>
    </section>
  );
}
