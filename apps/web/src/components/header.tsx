import React from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { Separator } from './ui/separator';

export function Header() {
  return (
    <header className="flex shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-lg font-medium">Dashboard</h1>
      </div>
    </header>
  );
}
