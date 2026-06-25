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
    <div className="flex w-full justify-center">
      <div
        className={cn(
          'flex flex-col gap-6 items-center w-full max-w-360 px-4 py-6',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
