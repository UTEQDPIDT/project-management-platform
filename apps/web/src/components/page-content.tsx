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
    <div className={cn('flex flex-col py-6 gap-6', className)}>{children}</div>
  );
}
