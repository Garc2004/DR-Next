import * as React from 'react';
import { cn } from '../lib/cn';

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: string;
  pulse?: boolean;
}

export function StatusDot({ color, pulse = false, className, ...props }: StatusDotProps) {
  return (
    <span
      role="status"
      className={cn('relative inline-flex size-2 shrink-0 rounded-full', className)}
      style={{ backgroundColor: color }}
      {...props}
    >
      {pulse ? (
        <span
          className="absolute inset-0 inline-flex size-full animate-ping rounded-full opacity-60"
          style={{ backgroundColor: color }}
        />
      ) : null}
    </span>
  );
}
