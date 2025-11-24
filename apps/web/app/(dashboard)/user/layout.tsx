import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/user-sidebar';

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="px-4 py-2">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
