import * as React from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { Separator } from './ui/separator';

import { cn } from '@/lib/utils';

function Header({
  className,
  children,
  ...props
}: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="header"
      className="flex shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
      {...props}
    >
      <div
        className={cn(
          'flex w-full items-center gap-1 px-4 py-2 lg:gap-2',
          className,
        )}
      >
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {children}
      </div>
    </header>
  );
}

function HeaderHeading({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="header-title"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

function HeaderTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="header-title"
      className={cn('leading-none text-lg font-semibold', className)}
      {...props}
    />
  );
}

function HeaderDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="header-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function HeaderContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="header-content"
      className={cn('flex gap-2 px-2 items-center justify-start', className)}
      {...props}
    />
  );
}

function HeaderAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="header-action"
      className={cn(
        'ml-auto flex gap-2 items-center justify-center',
        className,
      )}
      {...props}
    />
  );
}

export {
  Header,
  HeaderHeading,
  HeaderTitle,
  HeaderDescription,
  HeaderContent,
  HeaderAction,
};
