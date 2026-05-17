'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';
import { cn } from '../lib/cn';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

function Toaster({ className, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors={false}
      closeButton
      toastOptions={{
        classNames: {
          toast: cn(
            'group toast group-[.toaster]:bg-[var(--color-surface)] group-[.toaster]:text-[var(--color-ink)]',
            'group-[.toaster]:border group-[.toaster]:border-[var(--color-border)]',
            'group-[.toaster]:shadow-[var(--shadow-overlay)]',
          ),
          description: 'group-[.toast]:text-[var(--color-ink-mid)]',
          actionButton: 'group-[.toast]:bg-[var(--color-ink)] group-[.toast]:text-[var(--color-surface)]',
          cancelButton:
            'group-[.toast]:bg-[var(--color-surface-alt)] group-[.toast]:text-[var(--color-ink-mid)]',
        },
      }}
      className={cn(className)}
      {...props}
    />
  );
}

export { Toaster, toast };
