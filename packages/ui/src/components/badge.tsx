import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[var(--color-ink)] text-[var(--color-surface)]',
        secondary:
          'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-ink-mid)]',
        outline: 'border-[var(--color-border-strong)] text-[var(--color-ink)]',
        accent: 'border-transparent bg-[var(--color-accent-soft)] text-[var(--color-accent-dark)]',
        success: 'border-transparent bg-emerald-50 text-emerald-800',
        warning: 'border-transparent bg-amber-50 text-amber-900',
        destructive: 'border-transparent bg-red-50 text-red-800',
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
