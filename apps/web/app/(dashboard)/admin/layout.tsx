import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin-sidebar';
import { cookies } from 'next/headers';
import { ProfileProvider } from 'context/profile-provider';
import { redirect } from 'next/navigation';

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!accessToken || !apiBaseUrl) {
    redirect('/');
  }

  let user: any;

  try {
    const res = await fetch(`${apiBaseUrl}/users/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      redirect('/');
    }

    user = await res.json();
  } catch {
    redirect('/');
  }

  return (
    <ProfileProvider initialUser={user}>
      <SidebarProvider>
        <AdminSidebar />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </ProfileProvider>
  );
}
