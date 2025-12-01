import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/user-sidebar';

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <UserSidebar />
      <main className="w-full">{children}</main>
    </SidebarProvider>
  );
}
