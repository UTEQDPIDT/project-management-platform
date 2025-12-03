import React from 'react';
import { Spinner } from './ui/spinner';
import { cn } from '@/lib/utils';

export default function LoadingMessage({
  message = 'Cargando',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex gap-2 items-center select-none justify-center w-full',
        className,
      )}
    >
      <Spinner />
      <span className="text-muted-foreground text-sm">{message}</span>
    </div>
  );
}
