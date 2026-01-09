import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';
import React from 'react';

const iconSquareVariants = cva(
  'aspect-square h-10  rounded-md flex items-center justify-center',
  {
    variants: {
      color: {
        default: 'bg-secondary',
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        orange: 'bg-orange-50 text-orange-700',
        red: 'bg-red-50 text-red-700',
        yellow: 'bg-yellow-50 text-yellow-700',
        teal: 'bg-teal-50 text-teal-700',
        purple: 'bg-purple-50 text-purple-700',
        sky: 'bg-sky-50 text-sky-700',
        indigo: 'bg-indigo-50 text-indigo-700',
        pink: 'bg-pink-50 text-pink-700',
        rose: 'bg-rose-50 text-rose-700',
      },
    },
    defaultVariants: {
      color: 'default',
    },
  },
);

export default function IconSquare({
  children,
  className,
  color,
}: React.ComponentProps<'div'> & VariantProps<typeof iconSquareVariants>) {
  return (
    <div className={cn(iconSquareVariants({ color, className }))}>
      <span className="w-4 h-4 aspect-square flex items-center justify-center">
        {children}
      </span>
    </div>
  );
}
