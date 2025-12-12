import type { Metadata } from 'next';
import { AdminAuthWrapper } from './admin-auth-wrapper';

export const metadata: Metadata = {
  title: 'Admin | LinkedIn Voice Program Tracker',
  description: 'Manage tracked users for the LinkedIn Voice Program',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthWrapper>{children}</AdminAuthWrapper>;
}
