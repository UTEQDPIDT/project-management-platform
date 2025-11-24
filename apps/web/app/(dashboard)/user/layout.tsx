import { ReactNode } from 'react';

export default function UserDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
