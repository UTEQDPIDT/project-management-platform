import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/user-sidebar';
import { ProfileProvider } from 'context/profile-provider';
import { cookies } from 'next/headers';

export default async function UserDashboardLayout({
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
        <UserSidebar />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </ProfileProvider>
  );
}
