import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="px-4 py-2">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
