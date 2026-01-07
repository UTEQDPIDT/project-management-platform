import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { cookies } from 'next/headers';
import { ProfileProvider } from 'context/profile-provider';

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch user profile: ${res.status}`);
  }

  const user = await res.json();

  return (
    <ProfileProvider initialUser={user}>
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </ProfileProvider>
  );
}
