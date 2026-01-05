import { cn } from '@/lib/utils';
import React from 'react';

export default function IconSquare({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'aspect-square h-10 bg-secondary rounded-md flex items-center justify-center',
        className,
      )}
    >
      <span className="w-4 h-4 aspect-square flex items-center justify-center">
        {children}
      </span>
    </div>
  );
}
