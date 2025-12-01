import React from 'react';
import { cn } from '@/lib/utils';

export function PageContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col px-4 py-2.5 gap-2', className)}>
      {children}
    </div>
  );
}
