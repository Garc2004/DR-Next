import * as React from 'react';
import { cn } from '../lib/cn';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'narrow' | 'default' | 'wide' | 'full';
}

const sizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-screen-xl',
  wide: 'max-w-screen-2xl',
  full: 'max-w-none',
} as const;

export function PageContainer({
  size = 'default',
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8', sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
