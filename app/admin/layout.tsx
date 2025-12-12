import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | LinkedIn Voice Program Tracker',
  description: 'Manage tracked users for the LinkedIn Voice Program',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
